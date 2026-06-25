/// Shared memory reader — opens and reads AC's memory-mapped files on Windows.
///
/// AC creates three named file mappings:
/// - `Local\acpmf_physics`
/// - `Local\acpmf_graphics`
/// - `Local\acpmf_static`

use super::{
    SPageFileGraphic, SPageFilePhysics, SPageFileStatic, TelemetrySnapshot, TelemetryStaticInfo,
    wchar_to_string,
};

#[cfg(windows)]
use windows::Win32::Foundation::CloseHandle;
#[cfg(windows)]
use windows::Win32::System::Memory::{
    MapViewOfFile, OpenFileMappingW, UnmapViewOfFile, FILE_MAP_READ, MEMORY_MAPPED_VIEW_ADDRESS,
};
#[cfg(windows)]
use windows::core::PCWSTR;

/// Handle to a single memory-mapped file section
#[cfg(windows)]
#[allow(dead_code)]
struct MappedSection {
    handle: windows::Win32::Foundation::HANDLE,
    view: MEMORY_MAPPED_VIEW_ADDRESS,
    size: usize,
}

#[cfg(windows)]
impl Drop for MappedSection {
    fn drop(&mut self) {
        unsafe {
            let _ = UnmapViewOfFile(self.view);
            let _ = CloseHandle(self.handle);
        }
    }
}

/// Reads Assetto Corsa's shared memory telemetry data
pub struct AcSharedMemoryReader {
    #[cfg(windows)]
    physics: Option<MappedSection>,
    #[cfg(windows)]
    graphics: Option<MappedSection>,
    #[cfg(windows)]
    statics: Option<MappedSection>,
    /// Cached static info (read once)
    static_info: Option<TelemetryStaticInfo>,
    /// Session start timestamp
    session_start: Option<chrono::DateTime<chrono::Local>>,
}

impl AcSharedMemoryReader {
    /// Creates a new reader (not yet connected)
    pub fn new() -> Self {
        Self {
            #[cfg(windows)]
            physics: None,
            #[cfg(windows)]
            graphics: None,
            #[cfg(windows)]
            statics: None,
            static_info: None,
            session_start: None,
        }
    }

    /// Attempts to open AC's shared memory files.
    /// Returns true if successful (AC is running).
    #[cfg(windows)]
    pub fn open(&mut self) -> bool {
        self.close();

        let physics = Self::open_mapping("Local\\acpmf_physics", std::mem::size_of::<SPageFilePhysics>());
        let graphics = Self::open_mapping("Local\\acpmf_graphics", std::mem::size_of::<SPageFileGraphic>());
        let statics = Self::open_mapping("Local\\acpmf_static", std::mem::size_of::<SPageFileStatic>());

        if physics.is_some() && graphics.is_some() && statics.is_some() {
            self.physics = physics;
            self.graphics = graphics;
            self.statics = statics;
            self.session_start = Some(chrono::Local::now());

            // Read static info once
            if let Some(s) = self.read_static_raw() {
                self.static_info = Some(TelemetryStaticInfo {
                    car_model: wchar_to_string(&s.car_model),
                    track: wchar_to_string(&s.track),
                    track_configuration: wchar_to_string(&s.track_configuration),
                    player_name: wchar_to_string(&s.player_name),
                    player_surname: wchar_to_string(&s.player_surname),
                    max_rpm: s.max_rpm,
                    max_fuel: s.max_fuel,
                    sector_count: s.sector_count,
                    num_cars: s.num_cars,
                    car_skin: wchar_to_string(&s.car_skin),
                    has_drs: s.has_drs != 0,
                    has_ers: s.has_ers != 0,
                    has_kers: s.has_kers != 0,
                });
            }

            true
        } else {
            self.close();
            false
        }
    }

    /// Non-Windows stub
    #[cfg(not(windows))]
    pub fn open(&mut self) -> bool {
        false
    }

    /// Closes all open mappings
    pub fn close(&mut self) {
        #[cfg(windows)]
        {
            self.physics = None;
            self.graphics = None;
            self.statics = None;
        }
        self.static_info = None;
        self.session_start = None;
    }

    /// Whether AC shared memory is currently connected
    pub fn is_connected(&self) -> bool {
        #[cfg(windows)]
        {
            self.physics.is_some() && self.graphics.is_some() && self.statics.is_some()
        }
        #[cfg(not(windows))]
        {
            false
        }
    }

    /// Returns cached static info (set once on connection)
    pub fn static_info(&self) -> Option<&TelemetryStaticInfo> {
        self.static_info.as_ref()
    }

    /// Reads a complete telemetry snapshot from shared memory
    #[cfg(windows)]
    pub fn read_snapshot(&self) -> Option<TelemetrySnapshot> {
        let phys = self.read_physics_raw()?;
        let gfx = self.read_graphics_raw()?;
        let statics = self.static_info.as_ref()?;

        let elapsed_ms = self
            .session_start
            .map(|s| chrono::Local::now().signed_duration_since(s).num_milliseconds())
            .unwrap_or(0);

        Some(TelemetrySnapshot {
            timestamp_ms: elapsed_ms,
            speed_kmh: phys.speed_kmh,
            rpms: phys.rpms,
            gear: phys.gear,
            gas: phys.gas,
            brake: phys.brake,
            clutch: phys.clutch,
            steer_angle: phys.steer_angle,
            fuel: phys.fuel,
            g_force_lateral: phys.acc_g[0],
            g_force_longitudinal: phys.acc_g[2],
            tyre_temp: phys.tyre_core_temperature,
            tyre_wear: phys.tyre_wear,
            tyre_pressure: phys.wheels_pressure,
            brake_temp: phys.brake_temp,
            suspension_travel: phys.suspension_travel,
            car_damage: phys.car_damage,
            drs: phys.drs,
            tc: phys.tc,
            abs: phys.abs,
            air_temp: phys.air_temp,
            road_temp: phys.road_temp,
            turbo_boost: phys.turbo_boost,
            max_rpm: statics.max_rpm,
            max_fuel: statics.max_fuel,
            completed_laps: gfx.completed_laps,
            position: gfx.position,
            current_time_ms: gfx.i_current_time,
            last_time_ms: gfx.i_last_time,
            best_time_ms: gfx.i_best_time,
            current_sector_index: gfx.current_sector_index,
            last_sector_time_ms: gfx.last_sector_time,
            session_time_left: gfx.session_time_left,
            is_in_pit: gfx.is_in_pit != 0,
            is_in_pit_lane: gfx.is_in_pit_lane != 0,
            normalized_car_position: gfx.normalized_car_position,
            session_status: gfx.status,
            tyres_out: phys.number_of_tyres_out,
            pit_limiter: phys.pit_limiter_on != 0,
        })
    }

    /// Non-Windows stub
    #[cfg(not(windows))]
    pub fn read_snapshot(&self) -> Option<TelemetrySnapshot> {
        None
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /// Opens a named file mapping and maps a view of it
    #[cfg(windows)]
    fn open_mapping(name: &str, size: usize) -> Option<MappedSection> {
        let wide_name: Vec<u16> = name.encode_utf16().chain(std::iter::once(0)).collect();
        unsafe {
            let handle = OpenFileMappingW(FILE_MAP_READ.0, false, PCWSTR(wide_name.as_ptr())).ok()?;
            let view = MapViewOfFile(handle, FILE_MAP_READ, 0, 0, size);
            if view.Value.is_null() {
                let _ = CloseHandle(handle);
                return None;
            }
            Some(MappedSection {
                handle,
                view,
                size,
            })
        }
    }

    /// Reads the raw physics struct from shared memory
    #[cfg(windows)]
    fn read_physics_raw(&self) -> Option<SPageFilePhysics> {
        let section = self.physics.as_ref()?;
        unsafe {
            let ptr = section.view.Value as *const SPageFilePhysics;
            Some(std::ptr::read_volatile(ptr))
        }
    }

    /// Reads the raw graphics struct from shared memory
    #[cfg(windows)]
    fn read_graphics_raw(&self) -> Option<SPageFileGraphic> {
        let section = self.graphics.as_ref()?;
        unsafe {
            let ptr = section.view.Value as *const SPageFileGraphic;
            Some(std::ptr::read_volatile(ptr))
        }
    }

    /// Reads the raw static struct from shared memory
    #[cfg(windows)]
    fn read_static_raw(&self) -> Option<SPageFileStatic> {
        let section = self.statics.as_ref()?;
        unsafe {
            let ptr = section.view.Value as *const SPageFileStatic;
            Some(std::ptr::read_volatile(ptr))
        }
    }
}

// Safety: MappedSection is Send because the OS handles are valid across threads
#[cfg(windows)]
unsafe impl Send for MappedSection {}
#[cfg(windows)]
unsafe impl Sync for MappedSection {}
