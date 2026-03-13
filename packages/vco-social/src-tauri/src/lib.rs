mod vco_node;

use tauri::{AppHandle, Manager, State};
use vco_node::{NodeCommand, VcoNodeState};
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
async fn subscribe(channel_id: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    state.swarm_tx.send(NodeCommand::Subscribe(channel_id)).map_err(|e| e.to_string())
}

#[tauri::command]
async fn unsubscribe(channel_id: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    state.swarm_tx.send(NodeCommand::Unsubscribe(channel_id)).map_err(|e| e.to_string())
}

#[tauri::command]
async fn publish(channel_id: String, envelope_base64: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let data = general_purpose::STANDARD.decode(envelope_base64).map_err(|e| e.to_string())?;
    state.swarm_tx.send(NodeCommand::Publish(channel_id, data)).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_stats(state: State<'_, VcoNodeState>) -> Result<(), String> {
    state.swarm_tx.send(NodeCommand::GetStats).map_err(|e| e.to_string())
}

#[tauri::command]
async fn dial(addr: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    state.swarm_tx.send(NodeCommand::Dial(addr)).map_err(|e| e.to_string())
}

#[tauri::command]
async fn resolve(cid: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    state.swarm_tx.send(NodeCommand::Resolve(cid)).map_err(|e| e.to_string())
}

#[tauri::command]
async fn put_record(cid: String, payload_base64: String, state: State<'_, VcoNodeState>) -> Result<(), String> {
    let data = general_purpose::STANDARD.decode(payload_base64).map_err(|e| e.to_string())?;
    state.swarm_tx.send(NodeCommand::PutRecord(cid, data)).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();
            
            // Start libp2p node in a dedicated tokio task
            let tx = tauri::async_runtime::block_on(async move {
                vco_node::start_node(handle).await.expect("failed to start libp2p node")
            });
            app.manage(VcoNodeState { swarm_tx: tx });

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
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
