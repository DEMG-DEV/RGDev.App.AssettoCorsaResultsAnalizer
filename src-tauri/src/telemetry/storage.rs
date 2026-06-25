/// Telemetry storage — persists recorded telemetry sessions as JSON files.
///
/// Sessions are stored at:
///   `{app_data_dir}/telemetry/{YYYY-MM-DD_HH-MM-SS}_{track}_{car}.json`

use super::{TelemetrySnapshot, TelemetryStaticInfo};
use chrono::Local;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// A complete recorded telemetry session
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetrySession {
    /// When the session was recorded
    pub recorded_at: String,
    /// Car model ID
    pub car_model: String,
    /// Car skin
    pub car_skin: String,
    /// Track name
    pub track: String,
    /// Track configuration/layout
    pub track_configuration: String,
    /// Player name
    pub player_name: String,
    /// Maximum RPM for the car
    pub max_rpm: f32,
    /// Maximum fuel capacity
    pub max_fuel: f32,
    /// Total snapshots recorded
    pub snapshot_count: usize,
    /// Duration in milliseconds
    pub duration_ms: i64,
    /// All recorded snapshots (throttled to ~2Hz)
    pub snapshots: Vec<TelemetrySnapshot>,
}

/// Info about a saved telemetry session (for listing without loading full data)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetrySessionInfo {
    /// File name
    pub file_name: String,
    /// When the session was recorded
    pub recorded_at: String,
    /// Car model ID
    pub car_model: String,
    /// Track name
    pub track: String,
    /// Track configuration
    pub track_configuration: String,
    /// Duration in milliseconds
    pub duration_ms: i64,
    /// Total snapshots
    pub snapshot_count: usize,
    /// File size in bytes
    pub file_size: u64,
}

/// Manages telemetry session recording and file I/O
pub struct TelemetryStorage {
    data_dir: PathBuf,
    current_session: Option<TelemetrySession>,
    current_static: Option<TelemetryStaticInfo>,
}

impl TelemetryStorage {
    /// Creates a new storage instance
    pub fn new(app_data_dir: PathBuf) -> Self {
        let data_dir = app_data_dir.join("telemetry");
        // Ensure the telemetry directory exists
        let _ = fs::create_dir_all(&data_dir);

        Self {
            data_dir,
            current_session: None,
            current_static: None,
        }
    }

    /// Starts recording a new session
    pub fn start_session(&mut self, static_info: &TelemetryStaticInfo) {
        self.current_static = Some(static_info.clone());
        self.current_session = Some(TelemetrySession {
            recorded_at: Local::now().format("%Y-%m-%dT%H:%M:%S").to_string(),
            car_model: static_info.car_model.clone(),
            car_skin: static_info.car_skin.clone(),
            track: static_info.track.clone(),
            track_configuration: static_info.track_configuration.clone(),
            player_name: format!("{} {}", static_info.player_name, static_info.player_surname),
            max_rpm: static_info.max_rpm,
            max_fuel: static_info.max_fuel,
            snapshot_count: 0,
            duration_ms: 0,
            snapshots: Vec::new(),
        });
    }

    /// Adds a snapshot to the current recording
    pub fn add_snapshot(&mut self, snapshot: &TelemetrySnapshot) {
        if let Some(ref mut session) = self.current_session {
            session.snapshots.push(snapshot.clone());
            session.snapshot_count = session.snapshots.len();
            session.duration_ms = snapshot.timestamp_ms;
        }
    }

    /// Finishes the current session and saves to disk.
    /// Returns the file path of the saved session (or None if empty).
    pub fn finish_session(&mut self) -> Result<Option<String>, std::io::Error> {
        let session = match self.current_session.take() {
            Some(s) => s,
            None => return Ok(None),
        };
        self.current_static = None;

        if session.snapshots.is_empty() {
            return Ok(None);
        }

        // Generate file name: YYYY-MM-DD_HH-MM-SS_track_car.json
        let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S");
        let track_clean = sanitize_filename(&session.track);
        let car_clean = sanitize_filename(&session.car_model);
        let file_name = format!("{}_{}_{}_.json", timestamp, track_clean, car_clean);
        let file_path = self.data_dir.join(&file_name);

        let json = serde_json::to_string(&session)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        fs::write(&file_path, json)?;

        Ok(Some(file_path.to_string_lossy().to_string()))
    }

    /// Discards the current session without saving to disk.
    pub fn discard_session(&mut self) {
        self.current_session = None;
        self.current_static = None;
    }

    /// Lists all saved telemetry sessions (metadata only)
    pub fn list_sessions(&self) -> Result<Vec<TelemetrySessionInfo>, std::io::Error> {
        let mut sessions = Vec::new();

        if !self.data_dir.exists() {
            return Ok(sessions);
        }

        for entry in fs::read_dir(&self.data_dir)? {
            let entry = entry?;
            let path = entry.path();

            if !path.extension().map_or(false, |e| e == "json") {
                continue;
            }

            let file_name = entry.file_name().to_string_lossy().to_string();
            let file_size = entry.metadata()?.len();

            // Try to read just the metadata (first pass — read full file)
            match fs::read_to_string(&path) {
                Ok(content) => {
                    if let Ok(session) = serde_json::from_str::<TelemetrySession>(&content) {
                        sessions.push(TelemetrySessionInfo {
                            file_name,
                            recorded_at: session.recorded_at,
                            car_model: session.car_model,
                            track: session.track,
                            track_configuration: session.track_configuration,
                            duration_ms: session.duration_ms,
                            snapshot_count: session.snapshot_count,
                            file_size,
                        });
                    }
                }
                Err(_) => continue,
            }
        }

        sessions.sort_by(|a, b| b.recorded_at.cmp(&a.recorded_at));
        Ok(sessions)
    }

    /// Reads a full telemetry session from a file
    pub fn read_session(&self, file_name: &str) -> Result<TelemetrySession, String> {
        // Security: prevent path traversal
        if file_name.contains("..") || file_name.contains('/') || file_name.contains('\\') {
            return Err("Invalid file name".to_string());
        }

        let file_path = self.data_dir.join(file_name);
        if !file_path.exists() {
            return Err("Session file not found".to_string());
        }

        let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    }
}

/// Sanitizes a string for use in file names
fn sanitize_filename(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>()
        .chars()
        .take(30)
        .collect()
}
