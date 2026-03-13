use libp2p::{
    gossipsub, identify, kad, tcp,
    swarm::{NetworkBehaviour, SwarmEvent},
    Multiaddr, PeerId, StreamProtocol,
};
#[cfg(not(mobile))]
use libp2p::mdns;
use futures::StreamExt;
use serde::Serialize;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::{mpsc, Mutex};
use base64::{Engine as _, engine::general_purpose};
use libp2p::kad::store::MemoryStore;
use libp2p::kad::RecordKey;
use libp2p::kad::Record;
use std::fs;

#[derive(NetworkBehaviour)]
struct VcoBehaviour {
    identify: identify::Behaviour,
    kad: kad::Behaviour<MemoryStore>,
    gossipsub: gossipsub::Behaviour,
    #[cfg(not(mobile))]
    mdns: mdns::tokio::Behaviour,
}

#[derive(Serialize, Clone)]
#[serde(tag = "type")]
pub enum NodeEvent {
    #[serde(rename = "ready")]
    Ready { peer_id: String, multiaddrs: Vec<String> },
    #[serde(rename = "envelope")]
    Envelope { channel_id: String, envelope: String },
    #[serde(rename = "stats")]
    Stats {
        peer_id: String,
        multiaddrs: Vec<String>,
        peers: Vec<String>,
        connections: Vec<ConnectionInfo>,
    },
    #[serde(rename = "error")]
    Error { message: String },
    #[serde(rename = "resolving")]
    Resolving { cid: String },
    #[serde(rename = "dial_success")]
    DialSuccess { addr: String },
}

#[derive(Serialize, Clone)]
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
}

fn load_or_generate_keypair(app_handle: &AppHandle) -> anyhow::Result<libp2p::identity::Keypair> {
    let config_dir = app_handle.path().app_config_dir()?;
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

    let mut swarm = libp2p::SwarmBuilder::with_existing_identity(local_key.clone())
        .with_tokio()
        .with_tcp(tcp::Config::default(), libp2p::noise::Config::new, libp2p::yamux::Config::default)?
        .with_quic()
        .with_behaviour(|key| {
            let mut kad_config = kad::Config::new(StreamProtocol::new("/vco/kad/1.0.0"));
            kad_config.set_query_timeout(Duration::from_secs(10));
            let kad = kad::Behaviour::with_config(
                local_peer_id,
                MemoryStore::new(local_peer_id),
                kad_config,
            );
            
            let identify = identify::Behaviour::new(identify::Config::new(
                "/vco/1.0.0".into(),
                key.public(),
            ));
            
            let mut gossipsub_config = gossipsub::Config::default();
            gossipsub_config = gossipsub::ConfigBuilder::from(gossipsub_config)
                .max_transmit_size(2 * 1024 * 1024) // 2MB to support chunks
                .build()
                .expect("Valid gossipsub config");

            let gossipsub = gossipsub::Behaviour::new(
                gossipsub::MessageAuthenticity::Signed(key.clone()),
                gossipsub_config,
            )
            .expect("Valid gossipsub config");
            
            #[cfg(not(mobile))]
            let mdns = mdns::tokio::Behaviour::new(
                mdns::Config::default(),
                local_peer_id,
            ).expect("Valid mdns config");
            
            VcoBehaviour { 
                identify, 
                kad, 
                gossipsub, 
                #[cfg(not(mobile))]
                mdns 
            }
        })?
        .with_swarm_config(|c| c
            .with_idle_connection_timeout(Duration::from_secs(60))
        )
        .build();

    swarm.listen_on("/ip4/0.0.0.0/udp/0/quic-v1".parse()?)?;
    swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

    let handle = app_handle.clone();

    tokio::spawn(async move {
        loop {
            tokio::select! {
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
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Gossipsub(gossipsub::Event::Message {
                        message,
                        ..
                    })) => {
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
                        let _ = handle.emit("vco-node-event", NodeEvent::DialSuccess {
                            addr: format!("{} ({})", peer_id, endpoint.get_remote_address()),
                        });
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
                        let _ = swarm.behaviour_mut().kad.put_record(record, kad::Quorum::One);
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
                        let peers: Vec<String> = swarm.connected_peers().map(|p| p.to_string()).collect();
                        let connections: Vec<ConnectionInfo> = peers.iter().map(|p| ConnectionInfo {
                            remote_peer: p.clone(),
                            remote_addr: "unknown".to_string(),
                            tags: vec![],
                        }).collect();

                        let _ = handle.emit("vco-node-event", NodeEvent::Stats {
                            peer_id: local_peer_id.to_string(),
                            multiaddrs: swarm.listeners().map(|a| a.to_string()).collect(),
                            peers,
                            connections,
                        });
                    }
                    None => break,
                }
            }
        }
    });

    Ok(tx)
}
