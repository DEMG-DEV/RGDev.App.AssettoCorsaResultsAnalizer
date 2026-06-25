/// Telemetry poller — async loop that reads shared memory and emits Tauri events.
///
/// Runs in a background task at ~10Hz, emitting `telemetry://snapshot` events
/// to the frontend with each new `TelemetrySnapshot`.

use super::reader::AcSharedMemoryReader;
use super::storage::TelemetryStorage;
use super::{TelemetryStaticInfo, TelemetryStatus};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
use tokio::time::{Duration, interval};

/// Manages the telemetry polling lifecycle
pub struct TelemetryPoller {
    reader: Arc<Mutex<AcSharedMemoryReader>>,
    storage: Arc<Mutex<TelemetryStorage>>,
    is_running: Arc<Mutex<bool>>,
    static_info: Arc<Mutex<Option<TelemetryStaticInfo>>>,
}

impl TelemetryPoller {
    /// Creates a new poller instance
    pub fn new(app_data_dir: std::path::PathBuf) -> Self {
        Self {
            reader: Arc::new(Mutex::new(AcSharedMemoryReader::new())),
            storage: Arc::new(Mutex::new(TelemetryStorage::new(app_data_dir))),
            is_running: Arc::new(Mutex::new(false)),
            static_info: Arc::new(Mutex::new(None)),
        }
    }

    /// Starts the polling loop. Returns immediately — polling runs in background.
    pub async fn start(&self, app_handle: AppHandle) -> Result<(), String> {
        let mut running = self.is_running.lock().await;
        if *running {
            return Err("Telemetry is already running".to_string());
        }

        // Try to connect
        let mut reader = self.reader.lock().await;
        if !reader.open() {
            return Err("Could not connect to Assetto Corsa. Make sure the game is running.".to_string());
        }

        // Cache static info
        if let Some(info) = reader.static_info().cloned() {
            let mut si = self.static_info.lock().await;
            *si = Some(info.clone());

            // Start storage session
            let mut storage = self.storage.lock().await;
            storage.start_session(&info);

            // Emit static info to frontend
            let _ = app_handle.emit("telemetry://static-info", &info);
        }

        *running = true;
        drop(reader);
        drop(running);

        // Spawn the polling task
        let reader_clone = Arc::clone(&self.reader);
        let running_clone = Arc::clone(&self.is_running);
        let storage_clone = Arc::clone(&self.storage);
        let app_clone = app_handle.clone();

        tokio::spawn(async move {
            let mut ticker = interval(Duration::from_millis(100)); // 10Hz
            let mut last_packet_id: i32 = -1;
            let mut last_completed_laps: i32 = -1;

            loop {
                ticker.tick().await;

                // Check if we should stop
                {
                    let running = running_clone.lock().await;
                    if !*running {
                        break;
                    }
                }

                // Read snapshot
                let snapshot = {
                    let mut reader = reader_clone.lock().await;
                    if !reader.is_connected() {
                        // AC disconnected, try to reconnect
                        if !reader.open() {
                            // Emit disconnected status
                            let _ = app_clone.emit(
                                "telemetry://status",
                                TelemetryStatus {
                                    connected: false,
                                    recording: true,
                                    car_model: None,
                                    track: None,
                                    session_type: None,
                                },
                            );
                            continue;
                        }
                    }
                    reader.read_snapshot()
                };

                if let Some(snapshot) = snapshot {
                    // Emit to frontend
                    let _ = app_clone.emit("telemetry://snapshot", &snapshot);

                    // Store snapshot (throttled to ~2Hz for storage)
                    if snapshot.timestamp_ms % 500 < 100 {
                        let mut storage = storage_clone.lock().await;
                        storage.add_snapshot(&snapshot);
                    }

                    // Detect lap completion
                    if snapshot.completed_laps > last_completed_laps && last_completed_laps >= 0 {
                        let _ = app_clone.emit("telemetry://lap-completed", &snapshot);
                    }
                    last_completed_laps = snapshot.completed_laps;
                    let _ = last_packet_id; // suppress unused warning
                    last_packet_id = snapshot.rpms; // use rpms as rough packet tracker
                }
            }

            // Clean up on exit
            let mut reader = reader_clone.lock().await;
            reader.close();
        });

        Ok(())
    }

    /// Stops the polling loop and optionally saves the session
    pub async fn stop(&self, save_session: bool) -> Result<Option<String>, String> {
        let mut running = self.is_running.lock().await;
        *running = false;
        drop(running);

        // Give the polling task a moment to finish
        tokio::time::sleep(Duration::from_millis(200)).await;

        // Close reader
        let mut reader = self.reader.lock().await;
        reader.close();
        drop(reader);

        // Save or discard session based on user preference
        let mut storage = self.storage.lock().await;
        let path = if save_session {
            storage.finish_session().map_err(|e| e.to_string())?
        } else {
            storage.discard_session();
            None
        };

        // Clear static info
        let mut si = self.static_info.lock().await;
        *si = None;

        Ok(path)
    }

    /// Returns the current connection status
    pub async fn status(&self) -> TelemetryStatus {
        let running = self.is_running.lock().await;
        let reader = self.reader.lock().await;
        let si = self.static_info.lock().await;

        TelemetryStatus {
            connected: reader.is_connected(),
            recording: *running,
            car_model: si.as_ref().map(|s| s.car_model.clone()),
            track: si.as_ref().map(|s| s.track.clone()),
            session_type: None,
        }
    }
}
