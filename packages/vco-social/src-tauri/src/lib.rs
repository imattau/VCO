mod vco_node;

use tauri::{Manager, State};
use vco_node::{NodeCommand, VcoNodeState};
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
async fn subscribe(channel_id: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::Subscribe(channel_id)).map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}

#[tauri::command]
async fn unsubscribe(channel_id: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::Unsubscribe(channel_id)).map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}

#[tauri::command]
async fn publish(channel_id: String, envelope_base64: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let data = general_purpose::STANDARD.decode(envelope_base64).map_err(|e| e.to_string())?;
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::Publish(channel_id, data)).map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}

#[tauri::command]
async fn get_stats(state: State<'_, VcoNodeState>) -> Result<(), String> {
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::GetStats).map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}

#[tauri::command]
async fn dial(addr: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::Dial(addr)).map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}

#[tauri::command]
async fn resolve(cid: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::Resolve(cid)).map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}

#[tauri::command]
async fn put_record(cid: String, payload_base64: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let data = general_purpose::STANDARD.decode(payload_base64).map_err(|e| e.to_string())?;
    let tx_lock = state.swarm_tx.lock().await;
    if let Some(tx) = &*tx_lock {
        tx.send(NodeCommand::PutRecord(cid, data)).map_err(|e| e.to_string())
    } else {
        Err("Node not initialized".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();
            
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize state with None
            app.manage(VcoNodeState { swarm_tx: tokio::sync::Mutex::new(None) });

            // Start libp2p node in a dedicated async task
            tauri::async_runtime::spawn(async move {
                log::info!("VCO: Starting libp2p node...");
                match vco_node::start_node(handle.clone()).await {
                    Ok(tx) => {
                        log::info!("VCO: Node initialized successfully.");
                        let state = handle.state::<VcoNodeState>();
                        let mut tx_lock = state.swarm_tx.lock().await;
                        *tx_lock = Some(tx);
                    }
                    Err(e) => {
                        log::error!("VCO CRITICAL: Failed to start libp2p node: {:?}", e);
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            subscribe,
            unsubscribe,
            publish,
            get_stats,
            dial,
            resolve,
            put_record
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
