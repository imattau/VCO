use libp2p::{
    core::upgrade,
    identify, kad, noise, quic,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, Multiaddr, PeerId, Swarm,
};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::error::Error;
use std::time::Duration;
use tauri::{AppHandle, Manager, Emitter};
use tokio::sync::{mpsc, Mutex};
use std::sync::Arc;
use base64::{Engine as _, engine::general_purpose};

#[derive(NetworkBehaviour)]
struct VcoBehaviour {
    identify: identify::Behaviour,
    kad: kad::Behaviour<kad::store::MemoryStore>,
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
}

#[derive(Serialize, Clone)]
pub struct ConnectionInfo {
    pub remote_peer: String,
    pub remote_addr: String,
    pub tags: Vec<String>,
}

pub struct VcoNodeState {
    pub swarm_tx: mpsc::UnboundedSender<NodeCommand>,
}

pub enum NodeCommand {
    Subscribe(String),
    Unsubscribe(String),
    Publish(String, Vec<u8>),
    Dial(String),
    GetStats,
    Shutdown,
}

pub async fn start_node(app_handle: AppHandle) -> Result<mpsc::UnboundedSender<NodeCommand>, Box<dyn Error>> {
    let (tx, mut rx) = mpsc::unbounded_channel::<NodeCommand>();
    
    let local_key = libp2p::identity::Keypair::generate_ed25519();
    let local_peer_id = PeerId::from(local_key.public());

    let mut swarm = libp2p::SwarmBuilder::with_existing_identity(local_key)
        .with_tokio()
        .with_quic()
        .with_behaviour(|key| {
            let kad = kad::Behaviour::new(
                local_peer_id,
                kad::store::MemoryStore::new(local_peer_id),
            );
            let identify = identify::Behaviour::new(identify::Config::new(
                "/vco/1.0.0".into(),
                key.public(),
            ));
            VcoBehaviour { identify, kad }
        })?
        .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
        .build();

    swarm.listen_on("/ip4/0.0.0.0/udp/0/quic-v1".parse()?)?;

    let handle = app_handle.clone();
    
    tokio::spawn(async move {
        let mut subscriptions = HashSet::new();

        loop {
            tokio::select! {
                event = swarm.select_next_some() => match event {
                    SwarmEvent::NewListenAddr { address, .. } => {
                        handle.emit("vco-node-event", NodeEvent::Ready {
                            peer_id: local_peer_id.to_string(),
                            multiaddrs: vec![address.to_string()],
                        }).unwrap();
                    }
                    SwarmEvent::IncomingConnection { .. } => {}
                    SwarmEvent::Behaviour(VcoBehaviourEvent::Identify(identify::Event::Received { peer_id, info })) => {
                        println!("Identified peer {} {:?}", peer_id, info.listen_addrs);
                    }
                    _ => {}
                },
                command = rx.recv() => match command {
                    Some(NodeCommand::Subscribe(channel_id)) => {
                        subscriptions.insert(channel_id);
                    }
                    Some(NodeCommand::Unsubscribe(channel_id)) => {
                        subscriptions.remove(&channel_id);
                    }
                    Some(NodeCommand::Publish(channel_id, data)) => {
                        // In a real implementation, we would broadcast via Sync Session
                        // For now, we simulate by emitting back if subscribed
                        if subscriptions.contains(&channel_id) {
                            handle.emit("vco-node-event", NodeEvent::Envelope {
                                channel_id,
                                envelope: general_purpose::STANDARD.encode(data),
                            }).unwrap();
                        }
                    }
                    Some(NodeCommand::Dial(addr)) => {
                        if let Ok(maddr) = addr.parse::<Multiaddr>() {
                            let _ = swarm.dial(maddr);
                        }
                    }
                    Some(NodeCommand::GetStats) => {
                        let peers: Vec<String> = swarm.connected_peers().map(|p| p.to_string()).collect();
                        let connections: Vec<ConnectionInfo> = swarm.connections().map(|(p, c)| ConnectionInfo {
                            remote_peer: p.to_string(),
                            remote_addr: c.remote_address().to_string(),
                            tags: vec![],
                        }).collect();

                        handle.emit("vco-node-event", NodeEvent::Stats {
                            peer_id: local_peer_id.to_string(),
                            multiaddrs: swarm.listeners().map(|a| a.to_string()).collect(),
                            peers,
                            connections,
                        }).unwrap();
                    }
                    Some(NodeCommand::Shutdown) => break,
                    None => break,
                }
            }
        }
    });

    Ok(tx)
}
