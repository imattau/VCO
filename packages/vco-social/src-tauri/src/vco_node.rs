use libp2p::{
    gossipsub, identify, kad, tcp,
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

#[derive(NetworkBehaviour)]
struct VcoBehaviour {
    identify: identify::Behaviour,
    kad: kad::Behaviour<SledStore>,
    gossipsub: gossipsub::Behaviour,
    autonat: autonat::Behaviour,
    relay_client: relay::client::Behaviour,
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
#[serde(tag = "type", rename_all = "camelCase")]
pub enum NodeEvent {
    Ready { peer_id: String, multiaddrs: Vec<String> },
    Envelope { channel_id: String, envelope: String },
    Stats {
        peer_id: String,
        multiaddrs: Vec<String>,
        peers: Vec<String>,
        connections: Vec<ConnectionInfo>,
        network_load: f32,
    },
    Error { message: String },
    Resolving { cid: String },
    DialSuccess { addr: String },
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

    let (relay_transport, relay_client) = relay::client::new(local_peer_id);

    let sled_store = SledStore::new(&app_handle)?;

    // On mobile, with_dns() reads /etc/resolv.conf which doesn't exist on Android.
    // with_websocket() depends on DNS. Use TCP-only transport on mobile.
    #[cfg(mobile)]
    let mut swarm = {
        libp2p::SwarmBuilder::with_existing_identity(local_key.clone())
            .with_tokio()
            .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default)?
            .with_behaviour(|key: &libp2p::identity::Keypair| {
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
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client }
            })?
            .with_swarm_config(|c: libp2p::swarm::Config| c.with_idle_connection_timeout(Duration::from_secs(60)))
            .build()
    };

    #[cfg(not(mobile))]
    let mut swarm = {
        libp2p::SwarmBuilder::with_existing_identity(local_key.clone())
            .with_tokio()
            .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default)?
            .with_quic()
            .with_dns()?
            .with_websocket(libp2p::tls::Config::new, libp2p::yamux::Config::default)
            .await?
            .with_behaviour(|key: &libp2p::identity::Keypair| {
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
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, mdns }
            })?
            .with_swarm_config(|c: libp2p::swarm::Config| c.with_idle_connection_timeout(Duration::from_secs(60)))
            .build()
    };

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

    tokio::spawn(async move {
        let _keep_alive = relay_transport;
        
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
                            tags: vec![],
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
                        peer_addresses.insert(peer_id, addr.clone());
                        
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
                            addr: format!("{} ({})", peer_id, addr),
                        });
                    }
                    SwarmEvent::ConnectionClosed { peer_id, .. } => {
                        peer_addresses.remove(&peer_id);
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
                        if let Ok(maddr) = addr.parse::<Multiaddr>() {
                            let _ = swarm.dial(maddr);
                        }
                    }
                    Some(NodeCommand::Resolve(cid)) => {
                        let key = RecordKey::new(&cid);
                        swarm.behaviour_mut().kad.get_record(key);
                        let _ = handle.emit("vco-node-event", NodeEvent::Resolving { cid: cid.clone() });
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
                                tags: vec![],
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

                VcoBehaviour { 
                    identify, 
                    kad, 
                    gossipsub,
                    autonat,
                    relay_client,
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
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, #[cfg(not(mobile))] mdns }
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
                VcoBehaviour { identify, kad, gossipsub, autonat, relay_client, #[cfg(not(mobile))] mdns }
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
