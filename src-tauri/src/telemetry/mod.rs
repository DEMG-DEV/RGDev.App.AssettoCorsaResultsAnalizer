/// Telemetry module — Reads Assetto Corsa shared memory for live telemetry.
///
/// AC exposes three memory-mapped files:
/// - `Local\\acpmf_physics`  — high-frequency vehicle dynamics (~333Hz)
/// - `Local\\acpmf_graphics` — session/HUD data (~60Hz)
/// - `Local\\acpmf_static`   — constant session config (set once at start)

pub mod reader;
pub mod poller;
pub mod storage;

use serde::{Deserialize, Serialize};

// ─── AC Shared Memory Structures ──────────────────────────────────────────────
// These structs MUST match the exact binary layout of AC's shared memory.
// All fields use C alignment with #[repr(C)].

/// Physics data — updated every simulation step (~333Hz)
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct SPageFilePhysics {
    pub packet_id: i32,
    pub gas: f32,
    pub brake: f32,
    pub fuel: f32,
    pub gear: i32,
    pub rpms: i32,
    pub steer_angle: f32,
    pub speed_kmh: f32,
    pub velocity: [f32; 3],
    pub acc_g: [f32; 3],
    pub wheel_slip: [f32; 4],
    pub wheel_load: [f32; 4],
    pub wheels_pressure: [f32; 4],
    pub wheel_angular_speed: [f32; 4],
    pub tyre_wear: [f32; 4],
    pub tyre_dirty_level: [f32; 4],
    pub tyre_core_temperature: [f32; 4],
    pub camber_rad: [f32; 4],
    pub suspension_travel: [f32; 4],
    pub drs: f32,
    pub tc: f32,
    pub heading: f32,
    pub pitch: f32,
    pub roll: f32,
    pub cg_height: f32,
    pub car_damage: [f32; 5],
    pub number_of_tyres_out: i32,
    pub pit_limiter_on: i32,
    pub abs: f32,
    pub kers_charge: f32,
    pub kers_input: f32,
    pub auto_shifter_on: i32,
    pub ride_height: [f32; 2],
    pub turbo_boost: f32,
    pub ballast: f32,
    pub air_density: f32,
    pub air_temp: f32,
    pub road_temp: f32,
    pub local_angular_vel: [f32; 3],
    pub final_ff: f32,
    pub performance_meter: f32,
    pub engine_brake: i32,
    pub ers_recovery_level: i32,
    pub ers_power_level: i32,
    pub ers_heat_charging: i32,
    pub ers_is_charging: i32,
    pub kers_current_kj: f32,
    pub drs_available: i32,
    pub drs_enabled: i32,
    pub brake_temp: [f32; 4],
    pub clutch: f32,
    pub tyre_temp_i: [f32; 4],
    pub tyre_temp_m: [f32; 4],
    pub tyre_temp_o: [f32; 4],
    pub is_ai_controlled: i32,
    pub tyre_contact_point: [[f32; 3]; 4],
    pub tyre_contact_normal: [[f32; 3]; 4],
    pub tyre_contact_heading: [[f32; 3]; 4],
    pub brake_bias: f32,
    pub local_velocity: [f32; 3],
}

/// Graphics data — updated every rendered frame (~60Hz)
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct SPageFileGraphic {
    pub packet_id: i32,
    pub status: i32,          // AC_STATUS: 0=OFF, 1=REPLAY, 2=LIVE, 3=PAUSE
    pub session: i32,         // AC_SESSION_TYPE: 0=unknown, 1=practice, 2=qualify, 3=race
    pub current_time: [u16; 15],
    pub last_time: [u16; 15],
    pub best_time: [u16; 15],
    pub split: [u16; 15],
    pub completed_laps: i32,
    pub position: i32,
    pub i_current_time: i32,
    pub i_last_time: i32,
    pub i_best_time: i32,
    pub session_time_left: f32,
    pub distance_traveled: f32,
    pub is_in_pit: i32,
    pub current_sector_index: i32,
    pub last_sector_time: i32,
    pub number_of_laps: i32,
    pub tyre_compound: [u16; 33],
    pub replay_time_multiplier: f32,
    pub normalized_car_position: f32,
    pub car_coordinates: [f32; 3],
    pub penalty_time: f32,
    pub flag: i32,            // AC_FLAG_TYPE
    pub ideal_line_on: i32,
    pub is_in_pit_lane: i32,
    pub surface_grip: f32,
    pub mandatory_pit_done: i32,
}

/// Static data — set once when session starts, does not change during session
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct SPageFileStatic {
    pub sm_version: [u16; 15],
    pub ac_version: [u16; 15],
    pub number_of_sessions: i32,
    pub num_cars: i32,
    pub car_model: [u16; 33],
    pub track: [u16; 33],
    pub player_name: [u16; 33],
    pub player_surname: [u16; 33],
    pub player_nick: [u16; 33],
    pub sector_count: i32,
    pub max_rpm: f32,
    pub max_fuel: f32,
    pub suspension_max_travel: [f32; 4],
    pub tyre_radius: [f32; 4],
    pub max_turbo_boost: f32,
    pub deprecated_1: f32,
    pub deprecated_2: f32,
    pub penalty_enabled: i32,
    pub aid_fuel_rate: f32,
    pub aid_tire_rate: f32,
    pub aid_mechanical_damage: f32,
    pub aid_allow_tyre_blankets: i32,
    pub aid_stability: f32,
    pub aid_auto_clutch: i32,
    pub aid_auto_blip: i32,
    pub has_drs: i32,
    pub has_ers: i32,
    pub has_kers: i32,
    pub kers_max_j: f32,
    pub engine_brake_settings_count: i32,
    pub ers_power_controller_count: i32,
    pub track_spline_length: f32,
    pub track_configuration: [u16; 33],
    pub ers_max_j: f32,
    pub is_timed_race: i32,
    pub has_extra_lap: i32,
    pub car_skin: [u16; 33],
    pub reversed_grid_positions: i32,
    pub pit_window_start: i32,
    pub pit_window_end: i32,
}

// ─── Clean serializable types for frontend ───────────────────────────────────

/// Snapshot of telemetry data sent to the frontend per tick
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetrySnapshot {
    /// Timestamp in milliseconds since session start
    pub timestamp_ms: i64,
    /// Speed in km/h
    pub speed_kmh: f32,
    /// Engine RPM
    pub rpms: i32,
    /// Current gear (0=reverse, 1=neutral, 2=1st, etc.)
    pub gear: i32,
    /// Gas pedal input (0.0 to 1.0)
    pub gas: f32,
    /// Brake pedal input (0.0 to 1.0)
    pub brake: f32,
    /// Clutch pedal input (0.0 to 1.0)
    pub clutch: f32,
    /// Steering angle in radians
    pub steer_angle: f32,
    /// Fuel remaining in liters
    pub fuel: f32,
    /// G-force: lateral (X), vertical (Y), longitudinal (Z)
    pub g_force_lateral: f32,
    pub g_force_longitudinal: f32,
    /// Tyre core temperatures [FL, FR, RL, RR] in Celsius
    pub tyre_temp: [f32; 4],
    /// Tyre wear [FL, FR, RL, RR] (0.0 = new, 1.0 = destroyed)
    pub tyre_wear: [f32; 4],
    /// Tyre pressure [FL, FR, RL, RR] in PSI
    pub tyre_pressure: [f32; 4],
    /// Brake temperature [FL, FR, RL, RR] in Celsius
    pub brake_temp: [f32; 4],
    /// Suspension travel [FL, FR, RL, RR]
    pub suspension_travel: [f32; 4],
    /// Car damage [front, rear, left, right, ?]
    pub car_damage: [f32; 5],
    /// DRS status
    pub drs: f32,
    /// Traction control level
    pub tc: f32,
    /// ABS level
    pub abs: f32,
    /// Air temperature in Celsius
    pub air_temp: f32,
    /// Road temperature in Celsius
    pub road_temp: f32,
    /// Turbo boost pressure
    pub turbo_boost: f32,
    /// Maximum RPM for current car
    pub max_rpm: f32,
    /// Maximum fuel capacity
    pub max_fuel: f32,
    // Session/timing data
    /// Completed laps count
    pub completed_laps: i32,
    /// Current position in session
    pub position: i32,
    /// Current lap time in milliseconds
    pub current_time_ms: i32,
    /// Last lap time in milliseconds
    pub last_time_ms: i32,
    /// Best lap time in milliseconds
    pub best_time_ms: i32,
    /// Current sector index (0, 1, 2)
    pub current_sector_index: i32,
    /// Last sector time in milliseconds
    pub last_sector_time_ms: i32,
    /// Session time left in seconds (for timed sessions)
    pub session_time_left: f32,
    /// Whether car is in pit
    pub is_in_pit: bool,
    /// Whether car is in pit lane
    pub is_in_pit_lane: bool,
    /// Normalized car position on track (0.0 to 1.0)
    pub normalized_car_position: f32,
    /// Session status: 0=OFF, 1=REPLAY, 2=LIVE, 3=PAUSE
    pub session_status: i32,
    /// Number of tyres out of track
    pub tyres_out: i32,
    /// Pit limiter active
    pub pit_limiter: bool,
}

/// Static session info sent once when connection is established
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryStaticInfo {
    pub car_model: String,
    pub track: String,
    pub track_configuration: String,
    pub player_name: String,
    pub player_surname: String,
    pub max_rpm: f32,
    pub max_fuel: f32,
    pub sector_count: i32,
    pub num_cars: i32,
    pub car_skin: String,
    pub has_drs: bool,
    pub has_ers: bool,
    pub has_kers: bool,
}

/// Status of the telemetry connection
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryStatus {
    pub connected: bool,
    pub recording: bool,
    pub car_model: Option<String>,
    pub track: Option<String>,
    pub session_type: Option<String>,
}

// ─── Helper: convert wide char array to String ──────────────────────────────

/// Converts a fixed-size u16 (wchar_t) array to a Rust String, trimming null terminators.
pub fn wchar_to_string(wchars: &[u16]) -> String {
    let end = wchars.iter().position(|&c| c == 0).unwrap_or(wchars.len());
    String::from_utf16_lossy(&wchars[..end])
}
