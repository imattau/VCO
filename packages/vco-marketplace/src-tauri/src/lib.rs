use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct SidecarState(Mutex<Option<CommandChild>>);

#[tauri::command]
fn vco_publish(
    channel_id: String,
    envelope: String,
    state: State<SidecarState>,
) -> Result<(), String> {
    let mut guard = state.0.lock().unwrap();
    if let Some(child) = guard.as_mut() {
        let msg = serde_json::json!({
            "type": "publish",
            "channelId": channel_id,
            "envelope": envelope,
        });
        child
            .write((msg.to_string() + "\n").as_bytes())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn vco_subscribe(channel_id: String, state: State<SidecarState>) -> Result<(), String> {
    let mut guard = state.0.lock().unwrap();
    if let Some(child) = guard.as_mut() {
        let msg = serde_json::json!({ "type": "subscribe", "channelId": channel_id });
        child
            .write((msg.to_string() + "\n").as_bytes())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn start_sidecar(app: &AppHandle) -> Result<CommandChild, Box<dyn std::error::Error>> {
    let script_path = {
        #[cfg(debug_assertions)]
        {
            let manifest_dir = env!("CARGO_MANIFEST_DIR");
            let workspace_root = std::path::Path::new(manifest_dir)
                .parent()
                .and_then(|p| p.parent())
                .and_then(|p| p.parent())
                .expect("could not resolve workspace root");
            workspace_root
                .join("packages/vco-node/dist/main.js")
                .to_string_lossy()
                .to_string()
        }
        #[cfg(not(debug_assertions))]
        {
            app.path()
                .resource_dir()
                .expect("no resource dir")
                .join("vco-node/main.js")
                .to_string_lossy()
                .to_string()
        }
    };

    let (mut rx, child) = app
        .shell()
        .command("node")
        .args([&script_path])
        .spawn()
        .map_err(|e| format!("failed to spawn sidecar: {e}"))?;

    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        use tauri_plugin_shell::process::CommandEvent;
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    if let Ok(s) = String::from_utf8(line) {
                        let _ = app_handle.emit("vco://sidecar", s.trim().to_string());
                    }
                }
                CommandEvent::Stderr(line) => {
                    if let Ok(s) = String::from_utf8(line) {
                        eprintln!("[vco-node stderr] {}", s.trim());
                    }
                }
                CommandEvent::Terminated(status) => {
                    eprintln!("[vco-node] exited with {:?}", status);
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(child)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            let child = start_sidecar(app.handle())
                .expect("failed to start vco-node sidecar");
            *app.state::<SidecarState>().0.lock().unwrap() = Some(child);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![vco_publish, vco_subscribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
