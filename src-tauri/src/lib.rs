use base64::Engine;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

// === Known paths ===

fn cm_sessions_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        paths.push(
            PathBuf::from(local_app_data)
                .join("AcTools Content Manager")
                .join("Progress")
                .join("Sessions"),
        );
    }
    paths
}

fn ac_install_paths() -> Vec<PathBuf> {
    vec![
        PathBuf::from(r"D:\SteamLibrary\steamapps\common\assettocorsa"),
        PathBuf::from(r"C:\Program Files (x86)\Steam\steamapps\common\assettocorsa"),
        PathBuf::from(r"C:\Program Files\Steam\steamapps\common\assettocorsa"),
        PathBuf::from(r"E:\SteamLibrary\steamapps\common\assettocorsa"),
    ]
}

fn find_existing_path(candidates: &[PathBuf]) -> Option<PathBuf> {
    candidates.iter().find(|p| p.exists()).cloned()
}

// === Tauri command return types ===

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalStatus {
    cm_found: bool,
    ac_found: bool,
    cm_path: Option<String>,
    ac_path: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionFileInfo {
    name: String,
    size: u64,
    modified: f64,
}

// === Tauri Commands ===

#[tauri::command]
fn check_local_status() -> LocalStatus {
    let cm_path = find_existing_path(&cm_sessions_paths());
    let ac_path = find_existing_path(&ac_install_paths());

    LocalStatus {
        cm_found: cm_path.is_some(),
        ac_found: ac_path.is_some(),
        cm_path: cm_path.map(|p| p.to_string_lossy().to_string()),
        ac_path: ac_path.map(|p| p.to_string_lossy().to_string()),
    }
}

#[tauri::command]
fn list_cm_sessions() -> Result<Vec<SessionFileInfo>, String> {
    let cm_path = find_existing_path(&cm_sessions_paths())
        .ok_or_else(|| "CM sessions folder not found".to_string())?;

    let mut files: Vec<SessionFileInfo> = fs::read_dir(&cm_path)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let name = entry.file_name().to_string_lossy().to_string();
            if !name.to_lowercase().ends_with(".json") {
                return None;
            }
            let meta = entry.metadata().ok()?;
            let modified = meta
                .modified()
                .ok()?
                .duration_since(std::time::UNIX_EPOCH)
                .ok()?
                .as_secs_f64()
                * 1000.0; // ms since epoch
            Some(SessionFileInfo {
                name,
                size: meta.len(),
                modified,
            })
        })
        .collect();

    files.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(files)
}

#[tauri::command]
fn read_cm_session(file_name: String) -> Result<String, String> {
    // Security: prevent path traversal
    if file_name.contains("..") || file_name.contains('/') || file_name.contains('\\') {
        return Err("Invalid file name".to_string());
    }

    let cm_path = find_existing_path(&cm_sessions_paths())
        .ok_or_else(|| "CM sessions folder not found".to_string())?;

    let file_path = cm_path.join(&file_name);
    if !file_path.exists() {
        return Err("File not found".to_string());
    }

    fs::read_to_string(&file_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_car_preview(car_id: String, skin_name: Option<String>) -> Result<String, String> {
    // Security
    if car_id.contains("..") || car_id.contains('/') {
        return Err("Invalid car ID".to_string());
    }
    if let Some(ref s) = skin_name {
        if s.contains("..") || s.contains('/') {
            return Err("Invalid skin name".to_string());
        }
    }

    let ac_path = find_existing_path(&ac_install_paths())
        .ok_or_else(|| "AC install not found".to_string())?;

    // Try exact skin first
    if let Some(ref skin) = skin_name {
        let exact = ac_path
            .join("content")
            .join("cars")
            .join(&car_id)
            .join("skins")
            .join(skin)
            .join("preview.jpg");
        if exact.exists() {
            return read_image_as_data_url(&exact);
        }
    }

    // Fallback: first skin with preview
    let skins_dir = ac_path
        .join("content")
        .join("cars")
        .join(&car_id)
        .join("skins");

    if skins_dir.exists() {
        if let Ok(entries) = fs::read_dir(&skins_dir) {
            for entry in entries.flatten() {
                let preview = entry.path().join("preview.jpg");
                if preview.exists() {
                    return read_image_as_data_url(&preview);
                }
            }
        }
    }

    Err("Preview not found".to_string())
}

#[tauri::command]
fn get_car_info(car_id: String) -> Result<String, String> {
    if car_id.contains("..") || car_id.contains('/') {
        return Err("Invalid car ID".to_string());
    }

    let ac_path = find_existing_path(&ac_install_paths())
        .ok_or_else(|| "AC install not found".to_string())?;

    let info_path = ac_path
        .join("content")
        .join("cars")
        .join(&car_id)
        .join("ui")
        .join("ui_car.json");

    if !info_path.exists() {
        return Err("Car info not found".to_string());
    }

    let mut content = fs::read_to_string(&info_path).map_err(|e| e.to_string())?;
    // Remove BOM if present
    if content.starts_with('\u{FEFF}') {
        content = content[3..].to_string();
    }
    Ok(content)
}

/// Read an image file and return it as a data:image/jpeg;base64,... URL
fn read_image_as_data_url(path: &Path) -> Result<String, String> {
    let bytes = fs::read(path).map_err(|e| e.to_string())?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:image/jpeg;base64,{}", b64))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            check_local_status,
            list_cm_sessions,
            read_cm_session,
            get_car_preview,
            get_car_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
