use libp2p::{
    gossipsub, identify, kad, tcp, ping,
    swarm::{NetworkBehaviour, SwarmEvent},
    Multiaddr, PeerId, StreamProtocol,
    autonat, relay,
};
#[cfg(not(mobile))]
use libp2p::mdns;
use futures::StreamExt;
use serde::{Serialize, Deserialize};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::{mpsc, Mutex};
use base64::{Engine as _, engine::general_purpose};
use libp2p::kad::RecordKey;
use libp2p::kad::Record;
use std::fs;
use std::collections::HashMap;

use libp2p::kad::store::RecordStore;
use std::borrow::Cow;
use futures::AsyncReadExt as FuturesAsyncReadExt;
use futures::AsyncWriteExt as FuturesAsyncWriteExt;
use libp2p::swarm::{
    ConnectionHandler, ConnectionHandlerEvent, FromSwarm, SubstreamProtocol,
    THandler, THandlerInEvent, THandlerOutEvent, ToSwarm,
    handler::{ConnectionEvent, FullyNegotiatedOutbound, DialUpgradeError},
};
use libp2p::core::{upgrade::{ReadyUpgrade, DeniedUpgrade}, Endpoint, transport::PortUse};
use tokio::sync::oneshot;

pub struct SledStore {
    db: sled::Tree,
}

impl SledStore {
    pub fn new(app_handle: &AppHandle) -> anyhow::Result<Self> {
        let profile = std::env::var("VCO_PROFILE").unwrap_or_else(|_| "default".to_string());
        let path = app_handle.path().app_config_dir()?.join(&profile).join("dht_records");
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let db = sled::open(path)?;
        let tree = db.open_tree("records")?;
        Ok(Self { db: tree })
    }

    #[cfg(test)]
    pub fn new_test(path: &std::path::Path) -> anyhow::Result<Self> {
        let db = sled::open(path)?;
        let tree = db.open_tree("records")?;
        Ok(Self { db: tree })
    }
}

impl RecordStore for SledStore {
    type RecordsIter<'a> = std::vec::IntoIter<Cow<'a, Record>>;
    type ProvidedIter<'a> = std::vec::IntoIter<Cow<'a, kad::ProviderRecord>>;

    fn get(&self, k: &RecordKey) -> Option<Cow<'_, Record>> {
        self.db.get(k.as_ref()).ok().flatten().and_then(|v| {
            Some(Cow::Owned(Record {
                key: k.clone(),
                value: v.to_vec(),
                publisher: None,
                expires: None,
            }))
        })
    }

    fn put(&mut self, r: Record) -> kad::store::Result<()> {
        let _ = self.db.insert(r.key.as_ref(), r.value);
        Ok(())
    }

    fn remove(&mut self, k: &RecordKey) {
        let _ = self.db.remove(k.as_ref());
    }

    fn records(&self) -> Self::RecordsIter<'_> {
        let mut records = Vec::new();
        for item in self.db.iter() {
            if let Ok((k, v)) = item {
                records.push(Cow::Owned(Record {
                    key: RecordKey::new(&k),
                    value: v.to_vec(),
                    publisher: None,
                    expires: None,
                }));
            }
        }
        records.into_iter()
    }

    fn add_provider(&mut self, _record: kad::ProviderRecord) -> kad::store::Result<()> {
        Ok(())
    }

    fn providers(&self, _key: &RecordKey) -> Vec<kad::ProviderRecord> {
        Vec::new()
    }

    fn provided(&self) -> Self::ProvidedIter<'_> {
        Vec::<Cow<'_, kad::ProviderRecord>>::new().into_iter()
    }

    fn remove_provider(&mut self, _key: &RecordKey, _provider: &PeerId) {}
}

// ---------------------------------------------------------------------------
// DynKadStore — wraps either SledStore (desktop) or MemoryStore (mobile/
// fallback) behind a single concrete type so VcoBehaviour has one type param.
// ---------------------------------------------------------------------------

/// Unified Kademlia record store. Uses sled on desktop for persistence; falls
/// back to an in-memory store on mobile (where sled's mmap can fail on some
/// Android filesystems) or when sled fails to open.
pub enum DynKadStore {
    Sled(SledStore),
    Memory(kad::store::MemoryStore),
}

impl DynKadStore {
    /// Try to open sled; on failure log a warning and use an in-memory store.
    pub fn open(app_handle: &AppHandle, local_peer_id: PeerId) -> Self {
        match SledStore::new(app_handle) {
            Ok(s) => {
                log::info!("VCO: DHT store: sled (persistent)");
                DynKadStore::Sled(s)
            }
            Err(e) => {
                log::warn!("VCO: sled store unavailable ({}), falling back to in-memory DHT store", e);
                DynKadStore::Memory(kad::store::MemoryStore::new(local_peer_id))
            }
        }
    }
}

impl RecordStore for DynKadStore {
    type RecordsIter<'a> = std::vec::IntoIter<Cow<'a, Record>>;
    type ProvidedIter<'a> = std::vec::IntoIter<Cow<'a, kad::ProviderRecord>>;

    fn get(&self, k: &RecordKey) -> Option<Cow<'_, Record>> {
        match self {
            DynKadStore::Sled(s) => s.get(k),
            DynKadStore::Memory(m) => m.get(k).map(|r| Cow::Owned(r.into_owned())),
        }
    }

    fn put(&mut self, r: Record) -> kad::store::Result<()> {
        match self {
            DynKadStore::Sled(s) => s.put(r),
            DynKadStore::Memory(m) => m.put(r),
        }
    }

    fn remove(&mut self, k: &RecordKey) {
        match self {
            DynKadStore::Sled(s) => s.remove(k),
            DynKadStore::Memory(m) => m.remove(k),
        }
    }

    fn records(&self) -> Self::RecordsIter<'_> {
        match self {
            DynKadStore::Sled(s) => s.records(),
            DynKadStore::Memory(m) => {
                let v: Vec<Cow<'_, Record>> = m.records().map(|r| Cow::Owned(r.into_owned())).collect();
                v.into_iter()
            }
        }
    }

    fn add_provider(&mut self, record: kad::ProviderRecord) -> kad::store::Result<()> {
        match self {
            DynKadStore::Sled(s) => s.add_provider(record),
            DynKadStore::Memory(m) => m.add_provider(record),
        }
    }

    fn providers(&self, key: &RecordKey) -> Vec<kad::ProviderRecord> {
        match self {
            DynKadStore::Sled(s) => s.providers(key),
            DynKadStore::Memory(m) => m.providers(key),
        }
    }

    fn provided(&self) -> Self::ProvidedIter<'_> {
        match self {
            DynKadStore::Sled(s) => s.provided(),
            DynKadStore::Memory(m) => {
                let v: Vec<Cow<'_, kad::ProviderRecord>> = m.provided().map(|r| Cow::Owned(r.into_owned())).collect();
                v.into_iter()
            }
        }
    }

    fn remove_provider(&mut self, key: &RecordKey, provider: &PeerId) {
        match self {
            DynKadStore::Sled(s) => s.remove_provider(key, provider),
            DynKadStore::Memory(m) => m.remove_provider(key, provider),
        }
    }
}

const SYNC_PROTOCOL: StreamProtocol = StreamProtocol::new("/vco/sync/1.0.0");

// ---------------------------------------------------------------------------
// Custom stream behaviour — opens a single outbound substream on demand.
// Uses libp2p-swarm 0.45 (the same version as the libp2p 0.54 umbrella).
// ---------------------------------------------------------------------------

/// A handle that lets callers request a new outbound substream to a peer.
#[derive(Clone)]
pub struct SyncControl {
    tx: mpsc::UnboundedSender<(PeerId, oneshot::Sender<Result<libp2p::swarm::Stream, String>>)>,
}

impl SyncControl {
    /// Open an outbound `/vco/sync/1.0.0` substream to `peer`.
    pub async fn open_stream(
        &self,
        peer: PeerId,
    ) -> Result<libp2p::swarm::Stream, String> {
        let (resp_tx, resp_rx) = oneshot::channel();
        self.tx.send((peer, resp_tx)).map_err(|_| "sync behaviour shut down".to_string())?;
        resp_rx.await.map_err(|_| "sync behaviour dropped response".to_string())?
    }
}


/// Behaviour that opens outbound `/vco/sync/1.0.0` substreams on demand.
pub struct SyncStreamBehaviour {
    /// Pending open-stream requests received from `SyncControl`.
    pending: std::collections::VecDeque<(PeerId, oneshot::Sender<Result<libp2p::swarm::Stream, String>>)>,
    /// Receiver end of the control channel.
    rx: mpsc::UnboundedReceiver<(PeerId, oneshot::Sender<Result<libp2p::swarm::Stream, String>>)>,
}

impl SyncStreamBehaviour {
    pub fn new() -> (Self, SyncControl) {
        let (tx, rx) = mpsc::unbounded_channel();
        let beh = Self {
            pending: std::collections::VecDeque::new(),
            rx,
        };
        let ctrl = SyncControl { tx };
        (beh, ctrl)
    }
}

impl libp2p::swarm::NetworkBehaviour for SyncStreamBehaviour {
    type ConnectionHandler = SyncStreamHandler;
    type ToSwarm = std::convert::Infallible;

    fn handle_established_inbound_connection(
        &mut self,
        _connection_id: libp2p::swarm::ConnectionId,
        peer: PeerId,
        _local_addr: &libp2p::Multiaddr,
        _remote_addr: &libp2p::Multiaddr,
    ) -> Result<THandler<Self>, libp2p::swarm::ConnectionDenied> {
        Ok(SyncStreamHandler::new(peer))
    }

    fn handle_established_outbound_connection(
        &mut self,
        _connection_id: libp2p::swarm::ConnectionId,
        peer: PeerId,
        _addr: &libp2p::Multiaddr,
        _role_override: Endpoint,
        _port_use: PortUse,
    ) -> Result<THandler<Self>, libp2p::swarm::ConnectionDenied> {
        Ok(SyncStreamHandler::new(peer))
    }

    fn on_swarm_event(&mut self, _event: FromSwarm) {}

    fn on_connection_handler_event(
        &mut self,
        _peer_id: PeerId,
        _connection_id: libp2p::swarm::ConnectionId,
        event: THandlerOutEvent<Self>,
    ) {
        // Handler sends back (peer, result) — find and fulfil the pending oneshot.
        match event {
            SyncHandlerOut::StreamReady(peer, stream) => {
                // Find the first pending entry for this peer and respond.
                if let Some(pos) = self.pending.iter().position(|(p, _)| *p == peer) {
                    let (_, tx) = self.pending.remove(pos).unwrap();
                    let _ = tx.send(Ok(stream));
                }
            }
            SyncHandlerOut::StreamFailed(peer, err) => {
                if let Some(pos) = self.pending.iter().position(|(p, _)| *p == peer) {
                    let (_, tx) = self.pending.remove(pos).unwrap();
                    let _ = tx.send(Err(err));
                }
            }
        }
    }

    fn poll(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<ToSwarm<Self::ToSwarm, THandlerInEvent<Self>>> {
        // Drain incoming open-stream requests from the control channel.
        use std::task::Poll;
        loop {
            match self.rx.poll_recv(cx) {
                Poll::Ready(Some(req)) => {
                    let peer = req.0;
                    self.pending.push_back(req);
                    // Ask the handler for that peer to open an outbound substream.
                    return Poll::Ready(ToSwarm::NotifyHandler {
                        peer_id: peer,
                        handler: libp2p::swarm::NotifyHandler::Any,
                        event: SyncHandlerIn::OpenStream,
                    });
                }
                Poll::Ready(None) => break, // channel closed
                Poll::Pending => break,
            }
        }
        Poll::Pending
    }
}

// ---------------------------------------------------------------------------
// Connection handler for SyncStreamBehaviour
// ---------------------------------------------------------------------------

#[derive(Debug)]
pub enum SyncHandlerIn {
    OpenStream,
}

pub enum SyncHandlerOut {
    StreamReady(PeerId, libp2p::swarm::Stream),
    StreamFailed(PeerId, String),
}

impl std::fmt::Debug for SyncHandlerOut {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SyncHandlerOut::StreamReady(peer, _) => {
                f.debug_tuple("StreamReady").field(peer).finish()
            }
            SyncHandlerOut::StreamFailed(peer, err) => {
                f.debug_tuple("StreamFailed").field(peer).field(err).finish()
            }
        }
    }
}

pub struct SyncStreamHandler {
    /// Queued outbound substream requests not yet dispatched.
    pending_outbound: std::collections::VecDeque<()>,
    /// Events waiting to be emitted to the behaviour.
    pending_events: std::collections::VecDeque<
        ConnectionHandlerEvent<
            ReadyUpgrade<StreamProtocol>,
            (),
            SyncHandlerOut,
        >
    >,
    peer_id: PeerId,
    /// Number of currently open sync streams (incremented on negotiate, decremented on close).
    active_streams: usize,
}

impl SyncStreamHandler {
    fn new(peer_id: PeerId) -> Self {
        Self {
            pending_outbound: std::collections::VecDeque::new(),
            pending_events: std::collections::VecDeque::new(),
            peer_id,
            active_streams: 0,
        }
    }
}

impl ConnectionHandler for SyncStreamHandler {
    type FromBehaviour = SyncHandlerIn;
    type ToBehaviour = SyncHandlerOut;
    type InboundProtocol = DeniedUpgrade;
    type OutboundProtocol = ReadyUpgrade<StreamProtocol>;
    type InboundOpenInfo = ();
    type OutboundOpenInfo = ();

    fn listen_protocol(&self) -> SubstreamProtocol<Self::InboundProtocol, Self::InboundOpenInfo> {
        SubstreamProtocol::new(DeniedUpgrade, ())
    }

    fn on_behaviour_event(&mut self, event: Self::FromBehaviour) {
        match event {
            SyncHandlerIn::OpenStream => {
                self.pending_outbound.push_back(());
            }
        }
    }

    fn connection_keep_alive(&self) -> bool {
        // Keep the connection alive while we have pending requests or open sync streams.
        !self.pending_outbound.is_empty() || self.active_streams > 0
    }

    fn poll(
        &mut self,
        _cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<
        ConnectionHandlerEvent<
            Self::OutboundProtocol,
            Self::OutboundOpenInfo,
            Self::ToBehaviour,
        >
    > {
        use std::task::Poll;
        // Emit any queued events first.
        if let Some(ev) = self.pending_events.pop_front() {
            return Poll::Ready(ev);
        }
        // Open outbound substreams for pending requests.
        if self.pending_outbound.pop_front().is_some() {
            return Poll::Ready(ConnectionHandlerEvent::OutboundSubstreamRequest {
                protocol: SubstreamProtocol::new(
                    ReadyUpgrade::new(SYNC_PROTOCOL),
                    (),
                ),
            });
        }
        Poll::Pending
    }

    fn on_connection_event(
        &mut self,
        event: ConnectionEvent<
            Self::InboundProtocol,
            Self::OutboundProtocol,
            Self::InboundOpenInfo,
            Self::OutboundOpenInfo,
        >,
    ) {
        match event {
            ConnectionEvent::FullyNegotiatedOutbound(FullyNegotiatedOutbound { protocol: stream, info: _ }) => {
                self.active_streams += 1;
                self.pending_events.push_back(
                    ConnectionHandlerEvent::NotifyBehaviour(SyncHandlerOut::StreamReady(self.peer_id, stream))
                );
            }
            ConnectionEvent::DialUpgradeError(DialUpgradeError { error, .. }) => {
                self.pending_events.push_back(
                    ConnectionHandlerEvent::NotifyBehaviour(SyncHandlerOut::StreamFailed(
                        self.peer_id,
                        format!("Upgrade error: {:?}", error),
                    ))
                );
            }
            _ => {}
        }
    }
}

#[derive(NetworkBehaviour)]
struct VcoBehaviour {
    identify: identify::Behaviour,
    kad: kad::Behaviour<DynKadStore>,
    gossipsub: gossipsub::Behaviour,
    autonat: autonat::Behaviour,
    relay_client: relay::client::Behaviour,
    sync_stream: SyncStreamBehaviour,
    ping: ping::Behaviour,
    #[cfg(not(mobile))]
    mdns: mdns::tokio::Behaviour,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CachedPeer {
    peer_id: String,
    addrs: Vec<String>,
}

#[derive(Serialize, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum NodeEvent {
    #[serde(rename_all = "camelCase")]
    Ready { peer_id: String, multiaddrs: Vec<String> },
    #[serde(rename_all = "camelCase")]
    Envelope { channel_id: String, envelope: String },
    #[serde(rename_all = "camelCase")]
    Stats {
        peer_id: String,
        multiaddrs: Vec<String>,
        peers: Vec<String>,
        connections: Vec<ConnectionInfo>,
        network_load: f32,
    },
    #[serde(rename_all = "camelCase")]
    Error { message: String },
    #[serde(rename_all = "camelCase")]
    Resolving { cid: String, channel_id: String },
    #[serde(rename_all = "camelCase")]
    Dialing { peer_id: Option<String> },
    #[serde(rename_all = "camelCase")]
    DialSuccess { addr: String },
    #[serde(rename_all = "camelCase")]
    SyncSessionReady { session_id: String },
    #[serde(rename_all = "camelCase")]
    SyncFrame { session_id: String, frame_b64: String },
    #[serde(rename_all = "camelCase")]
    SyncComplete { session_id: String, received_count: u32 },
    #[serde(rename_all = "camelCase")]
    SyncError { session_id: String, message: String },
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionInfo {
    pub remote_peer: String,
    pub remote_addr: String,
    pub tags: Vec<String>,
}

pub struct VcoNodeState {
    pub swarm_tx: Mutex<Option<mpsc::UnboundedSender<NodeCommand>>>,
    pub sync_sessions: Mutex<HashMap<String, mpsc::UnboundedSender<Vec<u8>>>>,
}

pub enum NodeCommand {
    Subscribe(String),
    Unsubscribe(String),
    Publish(String, Vec<u8>),
    Dial(String),
    Resolve(String),
    PutRecord(String, Vec<u8>),
    GetStats,
    Bootstrap(Vec<String>),
    SyncWithRelay { relay_addr: String, session_id: String },
    Shutdown,
}

fn load_or_generate_keypair<R: tauri::Runtime>(app_handle: &AppHandle<R>) -> anyhow::Result<libp2p::identity::Keypair> {
    let profile = std::env::var("VCO_PROFILE").unwrap_or_else(|_| "default".to_string());
    let config_dir = app_handle.path().app_config_dir()?.join(&profile);
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)?;
    }
    
    let key_path = config_dir.join("libp2p_id.key");
    if key_path.exists() {
        let bytes = fs::read(key_path)?;
        Ok(libp2p::identity::Keypair::from_protobuf_encoding(&bytes)?)
    } else {
        let keypair = libp2p::identity::Keypair::generate_ed25519();
        let bytes = keypair.to_protobuf_encoding()?;
        fs::write(key_path, bytes)?;
        Ok(keypair)
    }
}

pub async fn start_node(app_handle: AppHandle) -> anyhow::Result<mpsc::UnboundedSender<NodeCommand>> {
    let (tx, mut rx) = mpsc::unbounded_channel::<NodeCommand>();

    let local_key = load_or_generate_keypair(&app_handle)?;
    let local_peer_id = PeerId::from(local_key.public());

    // Emit peerId immediately so the UI shows it before the swarm finishes starting
    let _ = app_handle.emit("vco-node-event", NodeEvent::Ready {
        peer_id: local_peer_id.to_string(),
        multiaddrs: vec![],
    });

    let sled_store = DynKadStore::open(&app_handle, local_peer_id);

    // Used to smuggle SyncControl out of the with_behaviour closure.
    let sync_control_slot: std::sync::Arc<std::sync::Mutex<Option<SyncControl>>> =
        std::sync::Arc::new(std::sync::Mutex::new(None));

    // On mobile, with_dns() reads /etc/resolv.conf which doesn't exist on Android.
    // with_websocket() depends on DNS. Use TCP-only transport on mobile.
    #[cfg(mobile)]
    let mut swarm = {
        let ctrl_slot = sync_control_slot.clone();
        libp2p::SwarmBuilder::with_existing_identity(local_key.clone())
            .with_tokio()
            .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default)?
            .with_quic()
            .with_relay_client(libp2p::noise::Config::new, libp2p::yamux::Config::default)?
            .with_behaviour(|key: &libp2p::identity::Keypair, relay_client| {
                let mut kad_config = kad::Config::new(StreamProtocol::new("/vco/kad/1.0.0"));
                kad_config.set_query_timeout(Duration::from_secs(10));
                let kad = kad::Behaviour::with_config(local_peer_id, sled_store, kad_config);
                let identify = identify::Behaviour::new(identify::Config::new("/vco/1.0.0".into(), key.public()));
                let mut gossipsub_config = gossipsub::Config::default();
                gossipsub_config = gossipsub::ConfigBuilder::from(gossipsub_config)
                    .max_transmit_size(2 * 1024 * 1024)
                    .build()
                    .expect("Valid gossipsub config");
                let gossipsub = gossipsub::Behaviour::new(
                    gossipsub::MessageAuthenticity::Signed(key.clone()),
                    gossipsub_config,
                ).expect("Valid gossipsub config");
                let autonat = autonat::Behaviour::new(local_peer_id, autonat::Config::default());
                let (sync_stream, ctrl) = SyncStreamBehaviour::new();
                *ctrl_slot.lock().unwrap() = Some(ctrl);
                let ping = ping::Behaviour::new(
                    ping::Config::new()
                        .with_interval(Duration::from_secs(30))
                        .with_timeout(Duration::from_secs(60)),
                );
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, sync_stream, ping }
            })?
            .with_swarm_config(|c: libp2p::swarm::Config| c.with_idle_connection_timeout(Duration::from_secs(300)))
            .build()
    };

    #[cfg(not(mobile))]
    let mut swarm = {
        let ctrl_slot = sync_control_slot.clone();
        libp2p::SwarmBuilder::with_existing_identity(local_key.clone())
            .with_tokio()
            .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default)?
            .with_quic()
            .with_dns()?
            .with_websocket(libp2p::tls::Config::new, libp2p::yamux::Config::default)
            .await?
            .with_relay_client(libp2p::noise::Config::new, libp2p::yamux::Config::default)?
            .with_behaviour(|key: &libp2p::identity::Keypair, relay_client| {
                let mut kad_config = kad::Config::new(StreamProtocol::new("/vco/kad/1.0.0"));
                kad_config.set_query_timeout(Duration::from_secs(10));
                let kad = kad::Behaviour::with_config(local_peer_id, sled_store, kad_config);
                let identify = identify::Behaviour::new(identify::Config::new("/vco/1.0.0".into(), key.public()));
                let mut gossipsub_config = gossipsub::Config::default();
                gossipsub_config = gossipsub::ConfigBuilder::from(gossipsub_config)
                    .max_transmit_size(2 * 1024 * 1024)
                    .build()
                    .expect("Valid gossipsub config");
                let gossipsub = gossipsub::Behaviour::new(
                    gossipsub::MessageAuthenticity::Signed(key.clone()),
                    gossipsub_config,
                ).expect("Valid gossipsub config");
                let autonat = autonat::Behaviour::new(local_peer_id, autonat::Config::default());
                let mdns = mdns::tokio::Behaviour::new(mdns::Config::default(), local_peer_id)
                    .expect("Valid mdns config");
                let (sync_stream, ctrl) = SyncStreamBehaviour::new();
                *ctrl_slot.lock().unwrap() = Some(ctrl);
                let ping = ping::Behaviour::new(
                    ping::Config::new()
                        .with_interval(Duration::from_secs(30))
                        .with_timeout(Duration::from_secs(60)),
                );
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, sync_stream, ping, mdns }
            })?
            .with_swarm_config(|c: libp2p::swarm::Config| c.with_idle_connection_timeout(Duration::from_secs(300)))
            .build()
    };

    // Extract the SyncControl handle captured from the behaviour closure.
    let sync_control = sync_control_slot.lock().unwrap().take()
        .expect("SyncControl must be set by behaviour constructor");

    // Android/restrictive environments may fail UDP/TCP binding
    if let Err(e) = swarm.listen_on("/ip4/0.0.0.0/udp/0/quic-v1".parse()?) {
        log::warn!("VCO: QUIC listen failed (non-fatal): {:?}", e);
    }
    if let Err(e) = swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?) {
        log::warn!("VCO: TCP listen failed (non-fatal): {:?}", e);
    }
    if let Err(e) = swarm.listen_on("/ip4/0.0.0.0/tcp/0/ws".parse()?) {
        log::warn!("VCO: WebSocket listen failed (non-fatal): {:?}", e);
    }

    let handle = app_handle.clone();
    let profile = std::env::var("VCO_PROFILE").unwrap_or_else(|_| "default".to_string());
    let cache_path = app_handle.path().app_config_dir()?.join(&profile).join("peer_cache.json");

    // Load cached peers
    if cache_path.exists() {
        if let Ok(data) = fs::read_to_string(&cache_path) {
            if let Ok(cached_peers) = serde_json::from_str::<Vec<CachedPeer>>(&data) {
                for cp in cached_peers {
                    if let Ok(peer_id) = cp.peer_id.parse::<PeerId>() {
                        for addr_str in cp.addrs {
                            if let Ok(addr) = addr_str.parse::<Multiaddr>() {
                                swarm.behaviour_mut().kad.add_address(&peer_id, addr);
                            }
                        }
                    }
                }
                let _ = swarm.behaviour_mut().kad.bootstrap();
            }
        }
    }

    let mut stats_interval = tokio::time::interval(Duration::from_secs(5));
    let mut peer_addresses: HashMap<PeerId, String> = HashMap::new();
    let mut message_count: u32 = 0;
    let mut last_minute = tokio::time::Instant::now();
    // Pending sync sessions awaiting ConnectionEstablished: peer_id -> session_id
    let mut pending_syncs: HashMap<PeerId, String> = HashMap::new();
    tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = stats_interval.tick() => {
                    let now = tokio::time::Instant::now();
                    let elapsed = now.duration_since(last_minute).as_secs_f32();
                    let network_load = 1.0 + (message_count as f32 / (elapsed / 60.0).max(1.0) / 100.0).min(4.0);
                    
                    if elapsed > 60.0 {
                        message_count = 0;
                        last_minute = now;
                    }

                    let peers: Vec<String> = swarm.connected_peers().map(|p: &PeerId| p.to_string()).collect();
                    let connections: Vec<ConnectionInfo> = peers.iter().map(|p: &String| {
                        let addr = p.parse::<PeerId>().ok()
                            .and_then(|id| peer_addresses.get(&id))
                            .cloned()
                            .unwrap_or_else(|| "unknown".to_string());
                        ConnectionInfo {
                            remote_peer: p.clone(),
                            remote_addr: addr,
                            tags: vec!["connected".to_string()],
                        }
                    }).collect();

                    let _ = handle.emit("vco-node-event", NodeEvent::Stats {
                        peer_id: local_peer_id.to_string(),
                        multiaddrs: swarm.listeners().map(|a: &Multiaddr| a.to_string()).collect(),
                        peers,
                        connections,
                        network_load,
                    });
                }
                event = swarm.select_next_some() => match event {
                    SwarmEvent::Dialing { peer_id, .. } => {
                        let _ = handle.emit("vco-node-event", NodeEvent::Dialing {
                            peer_id: peer_id.map(|p| p.to_string())
                        });
                    }
                    SwarmEvent::NewListenAddr { address, .. } => {
                        let _ = handle.emit("vco-node-event", NodeEvent::Ready {
                            peer_id: local_peer_id.to_string(),
                            multiaddrs: vec![address.to_string()],
                        });
                    }
                    #[cfg(not(mobile))]
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Mdns(mdns::Event::Discovered(list))) => {
                        for (peer_id, multiaddr) in list {
                            swarm.behaviour_mut().kad.add_address(&peer_id, multiaddr);
                        }
                    }
                    #[cfg(not(mobile))]
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Mdns(mdns::Event::Expired(list))) => {
                        for (peer_id, multiaddr) in list {
                            swarm.behaviour_mut().kad.remove_address(&peer_id, &multiaddr);
                        }
                    }
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Identify(identify::Event::Received { peer_id, info, .. })) => {
                        for addr in info.listen_addrs {
                            swarm.behaviour_mut().kad.add_address(&peer_id, addr);
                        }
                    }
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Autonat(autonat::Event::StatusChanged { old: _, new })) => {
                        log::info!("VCO: AutoNAT status changed to {:?}", new);
                    }
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Gossipsub(gossipsub::Event::Message {
                        message,
                        ..
                    })) => {
                        message_count += 1;
                        let channel_id = message.topic.as_str().to_string();
                        let envelope = general_purpose::STANDARD.encode(&message.data);
                        let _ = handle.emit("vco-node-event", NodeEvent::Envelope {
                            channel_id,
                            envelope,
                        });
                    }
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Kad(kad::Event::OutboundQueryProgressed {
                        result: kad::QueryResult::GetRecord(Ok(kad::GetRecordOk::FoundRecord(kad::PeerRecord { record: Record { key, value, .. }, .. }))),
                        ..
                    })) => {
                        let cid = String::from_utf8_lossy(key.as_ref()).into_owned();
                        let envelope = general_purpose::STANDARD.encode(&value);
                        let _ = handle.emit("vco-node-event", NodeEvent::Envelope {
                            channel_id: format!("vco://objects/{}", cid),
                            envelope,
                        });
                    }
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Kad(kad::Event::OutboundQueryProgressed {
                        result: kad::QueryResult::GetRecord(Err(e)),
                        ..
                    })) => {
                        let _ = handle.emit("vco-node-event", NodeEvent::Error {
                            message: format!("DHT query failed: {:?}", e),
                        });
                    }
                    SwarmEvent::ConnectionEstablished { peer_id, endpoint, .. } => {
                        let addr = endpoint.get_remote_address().to_string();
                        log::info!("VCO: Connection established with {} at {}", peer_id, addr);
                        peer_addresses.insert(peer_id, addr.clone());

                        // If there is a pending sync for this peer, open a libp2p substream
                        // using the stream behaviour's Control.  This runs over the already-
                        // negotiated Noise+Yamux connection — no raw TCP bypass.
                        if let Some(session_id) = pending_syncs.remove(&peer_id) {
                            let handle2 = handle.clone();
                            let app_handle2 = handle.clone();
                            // Clone the control: each clone shares the same channel.
                            let ctrl = sync_control.clone();
                            tokio::spawn(async move {
                                let libp2p_stream = match ctrl.open_stream(peer_id).await {
                                    Ok(s) => s,
                                    Err(e) => {
                                        let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                                            session_id: session_id.clone(),
                                            message: format!("Failed to open sync substream: {e}"),
                                        });
                                        return;
                                    }
                                };
                                let (mut read_half, mut write_half) = libp2p_stream.split();
                                let (write_tx, mut write_rx) = mpsc::unbounded_channel::<Vec<u8>>();
                                {
                                    let node_state = app_handle2.state::<VcoNodeState>();
                                    let mut sessions = node_state.sync_sessions.lock().await;
                                    sessions.insert(session_id.clone(), write_tx);
                                }
                                let _ = handle2.emit("vco-node-event", NodeEvent::SyncSessionReady {
                                    session_id: session_id.clone(),
                                });
                                let write_handle = handle2.clone();
                                let write_session = session_id.clone();
                                let write_app = app_handle2.clone();
                                tokio::spawn(async move {
                                    while let Some(bytes) = write_rx.recv().await {
                                        if write_half.write_all(&bytes).await.is_err() {
                                            let _ = write_handle.emit("vco-node-event", NodeEvent::SyncError {
                                                session_id: write_session.clone(),
                                                message: "Stream write error".to_string(),
                                            });
                                            let node_state = write_app.state::<VcoNodeState>();
                                            let mut sessions = node_state.sync_sessions.lock().await;
                                            sessions.remove(&write_session);
                                            break;
                                        }
                                    }
                                });
                                let mut received_count: u32 = 0;
                                loop {
                                    let mut len_buf = [0u8; 4];
                                    if read_half.read_exact(&mut len_buf).await.is_err() {
                                        if received_count > 0 {
                                            let _ = handle2.emit("vco-node-event", NodeEvent::SyncComplete {
                                                session_id: session_id.clone(),
                                                received_count,
                                            });
                                        } else {
                                            let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                                                session_id: session_id.clone(),
                                                message: "Stream closed unexpectedly".to_string(),
                                            });
                                        }
                                        let node_state = app_handle2.state::<VcoNodeState>();
                                        let mut sessions = node_state.sync_sessions.lock().await;
                                        sessions.remove(&session_id);
                                        break;
                                    }
                                    let frame_len = u32::from_be_bytes(len_buf) as usize;
                                    if frame_len == 0 {
                                        let _ = handle2.emit("vco-node-event", NodeEvent::SyncFrame {
                                            session_id: session_id.clone(),
                                            frame_b64: String::new(),
                                        });
                                        let _ = handle2.emit("vco-node-event", NodeEvent::SyncComplete {
                                            session_id: session_id.clone(),
                                            received_count,
                                        });
                                        let node_state = app_handle2.state::<VcoNodeState>();
                                        let mut sessions = node_state.sync_sessions.lock().await;
                                        sessions.remove(&session_id);
                                        break;
                                    }
                                    let mut body = vec![0u8; frame_len];
                                    if read_half.read_exact(&mut body).await.is_err() {
                                        let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                                            session_id: session_id.clone(),
                                            message: "Stream read error (body)".to_string(),
                                        });
                                        let node_state = app_handle2.state::<VcoNodeState>();
                                        let mut sessions = node_state.sync_sessions.lock().await;
                                        sessions.remove(&session_id);
                                        break;
                                    }
                                    received_count += 1;
                                    let frame_b64 = general_purpose::STANDARD.encode(&body);
                                    let _ = handle2.emit("vco-node-event", NodeEvent::SyncFrame {
                                        session_id: session_id.clone(),
                                        frame_b64,
                                    });
                                }
                            });
                        }

                        if let Ok(data) = fs::read_to_string(&cache_path) {
                            if let Ok(mut cached) = serde_json::from_str::<Vec<CachedPeer>>(&data) {
                                let peer_id_str = peer_id.to_string();
                                if let Some(cp) = cached.iter_mut().find(|c| c.peer_id == peer_id_str) {
                                    if !cp.addrs.contains(&addr) {
                                        cp.addrs.push(addr.clone());
                                    }
                                } else {
                                    cached.push(CachedPeer { peer_id: peer_id_str, addrs: vec![addr.clone()] });
                                }
                                if cached.len() > 100 {
                                    cached.remove(0);
                                }
                                let _ = fs::write(&cache_path, serde_json::to_string(&cached).unwrap_or_default());
                            }
                        } else {
                            let cached = vec![CachedPeer { peer_id: peer_id.to_string(), addrs: vec![addr.clone()] }];
                            let _ = fs::write(&cache_path, serde_json::to_string(&cached).unwrap_or_default());
                        }

                        let _ = handle.emit("vco-node-event", NodeEvent::DialSuccess {
                            addr: addr.clone(),
                        });
                    }
                    SwarmEvent::ConnectionClosed { peer_id, .. } => {
                        log::info!("VCO: Connection closed with {}", peer_id);
                        peer_addresses.remove(&peer_id);
                        // Emit updated stats immediately so the UI reflects disconnection.
                        let peers: Vec<String> = swarm.connected_peers().map(|p: &PeerId| p.to_string()).collect();
                        let connections: Vec<ConnectionInfo> = peers.iter().map(|p: &String| {
                            let addr = p.parse::<PeerId>().ok()
                                .and_then(|id| peer_addresses.get(&id))
                                .cloned()
                                .unwrap_or_else(|| "unknown".to_string());
                            ConnectionInfo {
                                remote_peer: p.clone(),
                                remote_addr: addr,
                                tags: vec!["connected".to_string()],
                            }
                        }).collect();
                        let now = tokio::time::Instant::now();
                        let elapsed = now.duration_since(last_minute).as_secs_f32();
                        let network_load = 1.0 + (message_count as f32 / (elapsed / 60.0).max(1.0) / 100.0).min(4.0);
                        let _ = handle.emit("vco-node-event", NodeEvent::Stats {
                            peer_id: local_peer_id.to_string(),
                            multiaddrs: swarm.listeners().map(|a: &Multiaddr| a.to_string()).collect(),
                            peers,
                            connections,
                            network_load,
                        });
                    }
                    SwarmEvent::OutgoingConnectionError { peer_id, error, .. } => {
                        let msg = format!("Dial failed to {:?}: {:?}", peer_id, error);
                        log::error!("VCO: {}", msg);
                        let _ = handle.emit("vco-node-event", NodeEvent::Error { message: msg });
                    }
                    SwarmEvent::IncomingConnectionError { error, .. } => {
                        log::warn!("VCO: Incoming connection error: {:?}", error);
                    }
                    _ => {}
                },
                command = rx.recv() => match command {
                    Some(NodeCommand::Subscribe(channel_id)) => {
                        let topic = gossipsub::IdentTopic::new(&channel_id);
                        let _ = swarm.behaviour_mut().gossipsub.subscribe(&topic);
                    }
                    Some(NodeCommand::Unsubscribe(channel_id)) => {
                        let topic = gossipsub::IdentTopic::new(&channel_id);
                        let _ = swarm.behaviour_mut().gossipsub.unsubscribe(&topic);
                    }
                    Some(NodeCommand::Publish(channel_id, data)) => {
                        message_count += 1;
                        let topic = gossipsub::IdentTopic::new(&channel_id);
                        let _ = swarm.behaviour_mut().gossipsub.publish(topic, data);
                    }
                    Some(NodeCommand::Dial(addr)) => {
                        match addr.parse::<Multiaddr>() {
                            Ok(maddr) => {
                                log::info!("VCO: Manual dial request to {}", maddr);
                                let mut peer_id_opt = None;
                                if let Some(peer_id) = maddr.iter().find_map(|p| match p {
                                    libp2p::multiaddr::Protocol::P2p(id) => Some(id),
                                    _ => None,
                                }) {
                                    peer_id_opt = Some(peer_id.to_string());
                                    swarm.behaviour_mut().kad.add_address(&peer_id, maddr.clone());
                                }

                                let _ = handle.emit("vco-node-event", NodeEvent::Dialing {
                                    peer_id: peer_id_opt
                                });

                                if let Err(e) = swarm.dial(maddr.clone()) {
                                    let _ = handle.emit("vco-node-event", NodeEvent::Error {
                                        message: format!("Dial failed: {:?}", e)
                                    });
                                }
                            }
                            Err(e) => {
                                let _ = handle.emit("vco-node-event", NodeEvent::Error {
                                    message: format!("Dial failed: Invalid multiaddress: {:?}", e)
                                });
                            }
                        }
                    }
                    Some(NodeCommand::Resolve(cid)) => {
                        let key = RecordKey::new(&cid);
                        swarm.behaviour_mut().kad.get_record(key);
                        let _ = handle.emit("vco-node-event", NodeEvent::Resolving { 
                            cid: cid.clone(),
                            channel_id: format!("vco://objects/{}", cid)
                        });
                    }
                    Some(NodeCommand::PutRecord(cid, payload)) => {
                        let key = RecordKey::new(&cid);
                        let record = Record {
                            key,
                            value: payload,
                            publisher: None,
                            expires: None,
                        };
                        let _ = swarm.behaviour_mut().kad.put_record(record, kad::Quorum::Majority);
                    }
                    Some(NodeCommand::Bootstrap(addrs)) => {
                        for addr in addrs {
                            if let Ok(maddr) = addr.parse::<Multiaddr>() {
                                if let Some(peer_id) = maddr.iter().find_map(|p| match p {
                                    libp2p::multiaddr::Protocol::P2p(id) => Some(id),
                                    _ => None,
                                }) {
                                    swarm.behaviour_mut().kad.add_address(&peer_id, maddr.clone());
                                    let _ = swarm.dial(maddr);
                                }
                            }
                        }
                        let _ = swarm.behaviour_mut().kad.bootstrap();
                    }
                    Some(NodeCommand::GetStats) => {
                        let now = tokio::time::Instant::now();
                        let elapsed = now.duration_since(last_minute).as_secs_f32();
                        let network_load = 1.0 + (message_count as f32 / (elapsed / 60.0).max(1.0) / 100.0).min(4.0);

                        let peers: Vec<String> = swarm.connected_peers().map(|p: &PeerId| p.to_string()).collect();
                        let connections: Vec<ConnectionInfo> = peers.iter().map(|p: &String| {
                            let addr = p.parse::<PeerId>().ok()
                                .and_then(|id| peer_addresses.get(&id))
                                .cloned()
                                .unwrap_or_else(|| "unknown".to_string());
                            ConnectionInfo {
                                remote_peer: p.clone(),
                                remote_addr: addr,
                                tags: vec!["connected".to_string()],
                            }                        }).collect();

                        let _ = handle.emit("vco-node-event", NodeEvent::Stats {
                            peer_id: local_peer_id.to_string(),
                            multiaddrs: swarm.listeners().map(|a: &Multiaddr| a.to_string()).collect(),
                            peers,
                            connections,
                            network_load,
                        });
                    }
                    Some(NodeCommand::SyncWithRelay { relay_addr, session_id }) => {
                        let maddr = match relay_addr.parse::<Multiaddr>() {
                            Ok(m) => m,
                            Err(e) => {
                                let _ = handle.emit("vco-node-event", NodeEvent::SyncError {
                                    session_id,
                                    message: format!("Invalid relay addr: {e}"),
                                });
                                continue;
                            }
                        };
                        let peer_id = match maddr.iter().find_map(|p| match p {
                            libp2p::multiaddr::Protocol::P2p(id) => Some(id),
                            _ => None,
                        }) {
                            Some(id) => id,
                            None => {
                                let _ = handle.emit("vco-node-event", NodeEvent::SyncError {
                                    session_id,
                                    message: "relay_addr missing /p2p/ component".to_string(),
                                });
                                continue;
                            }
                        };

                        // Register the pending sync; the actual TCP stream is opened in
                        // ConnectionEstablished using the confirmed endpoint address so that
                        // QUIC connections (where there is no TCP port in the user addr) are
                        // handled correctly via swarm transport negotiation.
                        pending_syncs.insert(peer_id, session_id.clone());
                        swarm.behaviour_mut().kad.add_address(&peer_id, maddr.clone());

                        // FIX: If we're already connected to this peer, ConnectionEstablished
                        // won't fire again. Trigger the sync logic immediately.
                        let already_connected = swarm.connected_peers().any(|p| p == &peer_id);
                        if already_connected {
                            log::info!("VCO: Peer {} already connected, triggering sync immediately", peer_id);
                            if let Some(session_id) = pending_syncs.remove(&peer_id) {
                                let handle2 = handle.clone();
                                let app_handle2 = handle.clone();
                                let ctrl = sync_control.clone();
                                tokio::spawn(async move {
                                    // ... same substream opening logic as ConnectionEstablished ...
                                    let libp2p_stream = match ctrl.open_stream(peer_id).await {
                                        Ok(s) => s,
                                        Err(e) => {
                                            let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                                                session_id: session_id.clone(),
                                                message: format!("Failed to open sync substream: {e}"),
                                            });
                                            return;
                                        }
                                    };
                                    let (mut read_half, mut write_half) = libp2p_stream.split();
                                    let (write_tx, mut write_rx) = mpsc::unbounded_channel::<Vec<u8>>();
                                    {
                                        let node_state = app_handle2.state::<VcoNodeState>();
                                        let mut sessions = node_state.sync_sessions.lock().await;
                                        sessions.insert(session_id.clone(), write_tx);
                                    }
                                    let _ = handle2.emit("vco-node-event", NodeEvent::SyncSessionReady {
                                        session_id: session_id.clone(),
                                    });
                                    let write_handle = handle2.clone();
                                    let write_session = session_id.clone();
                                    let write_app = app_handle2.clone();
                                    tokio::spawn(async move {
                                        while let Some(bytes) = write_rx.recv().await {
                                            if write_half.write_all(&bytes).await.is_err() {
                                                let _ = write_handle.emit("vco-node-event", NodeEvent::SyncError {
                                                    session_id: write_session.clone(),
                                                    message: "Stream write error".to_string(),
                                                });
                                                let node_state = write_app.state::<VcoNodeState>();
                                                let mut sessions = node_state.sync_sessions.lock().await;
                                                sessions.remove(&write_session);
                                                break;
                                            }
                                        }
                                    });
                                    let mut received_count: u32 = 0;
                                    loop {
                                        let mut len_buf = [0u8; 4];
                                        if read_half.read_exact(&mut len_buf).await.is_err() {
                                            if received_count > 0 {
                                                let _ = handle2.emit("vco-node-event", NodeEvent::SyncComplete {
                                                    session_id: session_id.clone(),
                                                    received_count,
                                                });
                                            } else {
                                                let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                                                    session_id: session_id.clone(),
                                                    message: "Stream closed unexpectedly".to_string(),
                                                });
                                            }
                                            let node_state = app_handle2.state::<VcoNodeState>();
                                            let mut sessions = node_state.sync_sessions.lock().await;
                                            sessions.remove(&session_id);
                                            break;
                                        }
                                        let frame_len = u32::from_be_bytes(len_buf) as usize;
                                        if frame_len == 0 {
                                            let _ = handle2.emit("vco-node-event", NodeEvent::SyncFrame {
                                                session_id: session_id.clone(),
                                                frame_b64: String::new(),
                                            });
                                            let _ = handle2.emit("vco-node-event", NodeEvent::SyncComplete {
                                                session_id: session_id.clone(),
                                                received_count,
                                            });
                                            let node_state = app_handle2.state::<VcoNodeState>();
                                            let mut sessions = node_state.sync_sessions.lock().await;
                                            sessions.remove(&session_id);
                                            break;
                                        }
                                        let mut body = vec![0u8; frame_len];
                                        if read_half.read_exact(&mut body).await.is_err() {
                                            let _ = handle2.emit("vco-node-event", NodeEvent::SyncError {
                                                session_id: session_id.clone(),
                                                message: "Stream read error (body)".to_string(),
                                            });
                                            let node_state = app_handle2.state::<VcoNodeState>();
                                            let mut sessions = node_state.sync_sessions.lock().await;
                                            sessions.remove(&session_id);
                                            break;
                                        }
                                        received_count += 1;
                                        let frame_b64 = general_purpose::STANDARD.encode(&body);
                                        let _ = handle2.emit("vco-node-event", NodeEvent::SyncFrame {
                                            session_id: session_id.clone(),
                                            frame_b64,
                                        });
                                    }
                                });
                            }
                        } else if let Err(e) = swarm.dial(maddr) {
                            pending_syncs.remove(&peer_id);
                            let _ = handle.emit("vco-node-event", NodeEvent::SyncError {
                                session_id,
                                message: format!("Swarm dial failed: {e}"),
                            });
                        }
                    }
                    Some(NodeCommand::Shutdown) => {
                        break;
                    }
                    None => break,
                }
            }
        }
    });

    Ok(tx)
}

#[cfg(test)]
mod tests {
    use super::*;
    use libp2p::identity::Keypair;
    use libp2p::SwarmBuilder;
    use libp2p::kad::Quorum;
    use std::time::Duration;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_load_or_generate_keypair() {
        let app = tauri::test::mock_app();
        let handle = app.handle();
        
        let kp1 = load_or_generate_keypair(handle).expect("Failed to load keypair 1");
        let kp2 = load_or_generate_keypair(handle).expect("Failed to load keypair 2");
        
        assert_eq!(kp1.to_protobuf_encoding().unwrap(), kp2.to_protobuf_encoding().unwrap());
    }

    #[tokio::test]
    async fn test_sled_persistence_across_restarts() {
        let tmp = tempdir().unwrap();
        let db_path = tmp.path().join("test_db");
        
        let key = RecordKey::new(&"persist-me");
        let val = b"permanent-swarm-data".to_vec();

        // 1. Initial write
        {
            let mut store = SledStore::new_test(&db_path).unwrap();
            store.put(Record {
                key: key.clone(),
                value: val.clone(),
                publisher: None,
                expires: None,
            }).unwrap();
        }

        // 2. Restart and verify
        {
            let store = SledStore::new_test(&db_path).unwrap();
            let record = store.get(&key).expect("Record lost after restart");
            assert_eq!(record.value, val);
        }
    }

    #[tokio::test]
    async fn test_kademlia_put_get_local() {
        let tmp = tempdir().unwrap();
        let db_path = tmp.path().join("test_db");
        let store = SledStore::new_test(&db_path).unwrap();

        let local_key = Keypair::generate_ed25519();
        let local_peer_id = PeerId::from(local_key.public());
        let protocol = StreamProtocol::new("/vco/kad/1.0.0");

        let mut swarm = SwarmBuilder::with_existing_identity(local_key)
            .with_tokio()
            .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default).unwrap()
            .with_behaviour(|key| {
                let kad_config = kad::Config::new(protocol.clone());
                let kad = kad::Behaviour::with_config(
                    local_peer_id,
                    store,
                    kad_config,
                );
                
                let identify = identify::Behaviour::new(identify::Config::new(
                    "/vco/1.0.0".into(),
                    key.public(),
                ));
                
                let gossipsub = gossipsub::Behaviour::new(
                    gossipsub::MessageAuthenticity::Signed(key.clone()),
                    gossipsub::Config::default(),
                ).unwrap();

                let autonat = autonat::Behaviour::new(local_peer_id, autonat::Config::default());
                let (_relay_transport, relay_client) = relay::client::new(local_peer_id);

                #[cfg(not(mobile))]
                let mdns = mdns::tokio::Behaviour::new(
                    mdns::Config::default(),
                    local_peer_id,
                ).unwrap();

                let (sync_stream, _ctrl) = SyncStreamBehaviour::new();
                let ping = ping::Behaviour::new(
                    ping::Config::new()
                        .with_interval(Duration::from_secs(30))
                        .with_timeout(Duration::from_secs(60)),
                );

                VcoBehaviour {
                    identify,
                    kad,
                    gossipsub,
                    autonat,
                    relay_client,
                    sync_stream,
                    ping,
                    #[cfg(not(mobile))]
                    mdns
                }
            }).unwrap()
            .build();

        let key = RecordKey::new(&"test-cid");
        let value = b"test-payload".to_vec();
        let record = Record {
            key: key.clone(),
            value: value.clone(),
            publisher: None,
            expires: None,
        };

        swarm.behaviour_mut().kad.put_record(record, Quorum::One).expect("Failed to put record");
        
        let record_from_store = swarm.behaviour_mut().kad.store_mut().get(&key).expect("Record not found in store");
        assert_eq!(record_from_store.value, value);
    }

    #[tokio::test]
    async fn test_kad_multi_node_exchange() {
        let protocol = StreamProtocol::new("/vco/kad/1.0.0");
        let tmp1 = tempdir().unwrap();
        let tmp2 = tempdir().unwrap();
        
        let key1 = Keypair::generate_ed25519();
        let peer1 = PeerId::from(key1.public());
        let store1 = SledStore::new_test(&tmp1.path().join("db1")).unwrap();
        
        let mut swarm1 = SwarmBuilder::with_existing_identity(key1)
            .with_tokio()
            .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default).unwrap()
            .with_behaviour(|key| {
                let kad_config = kad::Config::new(protocol.clone());
                let mut kad = kad::Behaviour::with_config(peer1, store1, kad_config);
                kad.set_mode(Some(kad::Mode::Server)); 
                let identify = identify::Behaviour::new(identify::Config::new("/vco/1.0.0".into(), key.public()));
                let gossipsub = gossipsub::Behaviour::new(gossipsub::MessageAuthenticity::Signed(key.clone()), gossipsub::Config::default()).unwrap();
                let autonat = autonat::Behaviour::new(peer1, autonat::Config::default());
                let (_rt, relay_client) = relay::client::new(peer1);
                std::mem::forget(_rt); // Keep alive
                #[cfg(not(mobile))]
                let mdns = mdns::tokio::Behaviour::new(mdns::Config::default(), peer1).unwrap();
                let (sync_stream, _ctrl) = SyncStreamBehaviour::new();
                let ping = ping::Behaviour::new(ping::Config::new().with_interval(Duration::from_secs(30)));
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, sync_stream, ping, #[cfg(not(mobile))] mdns }
            }).unwrap().build();

        let key2 = Keypair::generate_ed25519();
        let peer2 = PeerId::from(key2.public());
        let store2 = SledStore::new_test(&tmp2.path().join("db2")).unwrap();
        
        let mut swarm2 = SwarmBuilder::with_existing_identity(key2)
            .with_tokio()
            .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default).unwrap()
            .with_behaviour(|key| {
                let kad_config = kad::Config::new(protocol.clone());
                let mut kad = kad::Behaviour::with_config(peer2, store2, kad_config);
                kad.set_mode(Some(kad::Mode::Server)); 
                let identify = identify::Behaviour::new(identify::Config::new("/vco/1.0.0".into(), key.public()));
                let gossipsub = gossipsub::Behaviour::new(gossipsub::MessageAuthenticity::Signed(key.clone()), gossipsub::Config::default()).unwrap();
                let autonat = autonat::Behaviour::new(peer2, autonat::Config::default());
                let (_rt, relay_client) = relay::client::new(peer2);
                std::mem::forget(_rt); // Keep alive
                #[cfg(not(mobile))]
                let mdns = mdns::tokio::Behaviour::new(mdns::Config::default(), peer2).unwrap();
                let (sync_stream, _ctrl) = SyncStreamBehaviour::new();
                let ping = ping::Behaviour::new(ping::Config::new().with_interval(Duration::from_secs(30)));
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, sync_stream, ping, #[cfg(not(mobile))] mdns }
            }).unwrap().build();

        swarm1.listen_on("/ip4/127.0.0.1/tcp/0".parse().unwrap()).unwrap();
        let addr1 = loop {
            if let SwarmEvent::NewListenAddr { address, .. } = swarm1.select_next_some().await {
                break address;
            }
        };

        swarm2.listen_on("/ip4/127.0.0.1/tcp/0".parse().unwrap()).unwrap();
        let addr2 = loop {
            if let SwarmEvent::NewListenAddr { address, .. } = swarm2.select_next_some().await {
                break address;
            }
        };

        swarm2.behaviour_mut().kad.add_address(&peer1, addr1.clone());
        swarm1.behaviour_mut().kad.add_address(&peer2, addr2.clone());

        let record_key = RecordKey::new(&"shared-cid");
        let record_value = b"swarm-data".to_vec();
        
        swarm1.behaviour_mut().kad.store_mut().put(Record {
            key: record_key.clone(),
            value: record_value.clone(),
            publisher: None,
            expires: None,
        }).unwrap();

        let mut found = false;
        let mut connected = false;

        for i in 0..500 {
            tokio::select! {
                _event = swarm1.select_next_some() => {},
                event = swarm2.select_next_some() => {
                    if let SwarmEvent::ConnectionEstablished { peer_id, .. } = event {
                        if peer_id == peer1 {
                            connected = true;
                            // Wait for commit
                            tokio::time::sleep(Duration::from_millis(100)).await;
                            swarm2.behaviour_mut().kad.get_record(record_key.clone());
                        }
                    }
                    
                    if let SwarmEvent::Behaviour(VcoBehaviourEvent::Kad(kad::Event::OutboundQueryProgressed { 
                        result: kad::QueryResult::GetRecord(Ok(kad::GetRecordOk::FoundRecord(kad::PeerRecord { record, .. }))), 
                        .. 
                    })) = event {
                        if record.key == record_key {
                            assert_eq!(record.value, record_value);
                            found = true;
                            break;
                        }
                    }
                }
                _ = tokio::time::sleep(Duration::from_millis(20)) => {
                    if i == 0 {
                        swarm2.dial(peer1).unwrap();
                    }
                    if i > 100 && connected && !found && i % 50 == 0 {
                        swarm2.behaviour_mut().kad.get_record(record_key.clone());
                    }
                }
            }
            if found { break; }
        }

        assert!(found, "Node 2 failed to retrieve record. Connected: {}", connected);
    }
}
