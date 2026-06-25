/**
 * TelemetryCharts — Professional telemetry analysis charts inspired by
 * MoTeC i2, Track Titan, and real-world racing engineer tools.
 *
 * Charts included:
 *  1. Speed Trace — velocity over time (the "big picture" chart)
 *  2. RPM & Gear Trace — engine usage with gear overlay
 *  3. Driver Inputs — throttle, brake, clutch traces (MoTeC style stacked)
 *  4. G-Force Scatter — lateral vs longitudinal friction circle
 *  5. Tyre Temperatures — all 4 corners over time
 *  6. Tyre Wear Progression — wear degradation over time
 *  7. Brake Temperatures — thermal management per corner
 *  8. Fuel Consumption — fuel level depletion curve
 *  9. Steering Angle Trace — steering smoothness analysis
 * 10. Suspension Travel — ride height / bump analysis
 */

import React, { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { TelemetrySessionData } from '../../core/models/telemetry-types';
import { GEAR_LABELS } from '../../core/models/telemetry-types';
import { es } from '../../i18n/es';

// Chart color tokens
const C = {
  speed: '#22d3ee',
  rpm: '#f97316',
  gear: '#a78bfa',
  throttle: '#22c55e',
  brake: '#ef4444',
  clutch: '#3b82f6',
  gForce: '#f59e0b',
  fl: '#ef4444',
  fr: '#f97316',
  rl: '#3b82f6',
  rr: '#22c55e',
  fuel: '#eab308',
  steering: '#a78bfa',
  susp: '#06b6d4',
};

const TOOLTIP_STYLE = {
  background: 'var(--bg-glass)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  backdropFilter: 'blur(12px)',
  fontSize: '0.8rem',
};

interface Props {
  data: TelemetrySessionData;
}

/** Downsample data for chart performance — take every Nth point */
function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
}

export const TelemetryCharts: React.FC<Props> = ({ data }) => {
  // Pre-process snapshots for charts
  const chartData = useMemo(() => {
    const sampled = downsample(data.snapshots, 600);
    return sampled.map((s) => ({
      time: +(s.timestampMs / 1000).toFixed(1),
      speed: +s.speedKmh.toFixed(1),
      rpm: s.rpms,
      gear: s.gear,
      gearLabel: GEAR_LABELS[s.gear] ?? String(s.gear),
      gas: +(s.gas * 100).toFixed(1),
      brake: +(s.brake * 100).toFixed(1),
      clutch: +(s.clutch * 100).toFixed(1),
      gLat: +s.gForceLateral.toFixed(2),
      gLon: +s.gForceLongitudinal.toFixed(2),
      tyreTempFL: +s.tyreTemp[0].toFixed(1),
      tyreTempFR: +s.tyreTemp[1].toFixed(1),
      tyreTempRL: +s.tyreTemp[2].toFixed(1),
      tyreTempRR: +s.tyreTemp[3].toFixed(1),
      tyreWearFL: +(s.tyreWear[0] * 100).toFixed(1),
      tyreWearFR: +(s.tyreWear[1] * 100).toFixed(1),
      tyreWearRL: +(s.tyreWear[2] * 100).toFixed(1),
      tyreWearRR: +(s.tyreWear[3] * 100).toFixed(1),
      brakeTempFL: +s.brakeTemp[0].toFixed(0),
      brakeTempFR: +s.brakeTemp[1].toFixed(0),
      brakeTempRL: +s.brakeTemp[2].toFixed(0),
      brakeTempRR: +s.brakeTemp[3].toFixed(0),
      fuel: +s.fuel.toFixed(2),
      steer: +(s.steerAngle * (180 / Math.PI)).toFixed(1), // radians to degrees
      suspFL: +s.suspensionTravel[0].toFixed(3),
      suspFR: +s.suspensionTravel[1].toFixed(3),
      suspRL: +s.suspensionTravel[2].toFixed(3),
      suspRR: +s.suspensionTravel[3].toFixed(3),
    }));
  }, [data.snapshots]);

  // G-Force scatter data (more samples for density)
  const gForceData = useMemo(() => {
    const sampled = downsample(data.snapshots, 1200);
    return sampled.map((s) => ({
      x: +s.gForceLateral.toFixed(2),
      y: +s.gForceLongitudinal.toFixed(2),
    }));
  }, [data.snapshots]);

  const axisProps = {
    stroke: 'var(--text-muted)',
    fontSize: 11,
    tickLine: false,
  };

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: 'var(--border-subtle)',
    opacity: 0.5,
  };

  return (
    <div className="telemetry-charts">
      {/* 1. Speed Trace */}
      <div className="telemetry-chart-card telemetry-chart-wide">
        <h4>🏎️ {es.telemetry.speedTrace}</h4>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit=" km/h" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="speed"
              stroke={C.speed}
              fill={C.speed}
              fillOpacity={0.1}
              strokeWidth={1.5}
              dot={false}
              name={es.telemetry.speed}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2. RPM & Gear Trace */}
      <div className="telemetry-chart-card telemetry-chart-wide">
        <h4>⚙️ {es.telemetry.rpmGearTrace}</h4>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} domain={[0, Math.ceil(data.maxRpm / 1000) * 1000]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Area
              type="monotone"
              dataKey="rpm"
              stroke={C.rpm}
              fill={C.rpm}
              fillOpacity={0.08}
              strokeWidth={1.5}
              dot={false}
              name={es.telemetry.rpm}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Driver Inputs — Throttle/Brake/Clutch */}
      <div className="telemetry-chart-card telemetry-chart-wide">
        <h4>🕹️ {es.telemetry.driverInputs}</h4>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} domain={[0, 100]} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Area
              type="monotone"
              dataKey="gas"
              stroke={C.throttle}
              fill={C.throttle}
              fillOpacity={0.2}
              strokeWidth={1.5}
              dot={false}
              name={es.telemetry.throttle}
            />
            <Area
              type="monotone"
              dataKey="brake"
              stroke={C.brake}
              fill={C.brake}
              fillOpacity={0.2}
              strokeWidth={1.5}
              dot={false}
              name={es.telemetry.brakeLabel}
            />
            <Area
              type="monotone"
              dataKey="clutch"
              stroke={C.clutch}
              fill={C.clutch}
              fillOpacity={0.1}
              strokeWidth={1}
              dot={false}
              name={es.telemetry.clutchLabel}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. G-Force Scatter — Friction Circle */}
      <div className="telemetry-chart-card">
        <h4>🎯 {es.telemetry.gForceAnalysis}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid {...gridProps} />
            <XAxis
              type="number"
              dataKey="x"
              name={es.telemetry.lateral}
              domain={[-2.5, 2.5]}
              {...axisProps}
              label={{ value: es.telemetry.lateral, position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={es.telemetry.longitudinal}
              domain={[-2.5, 2.5]}
              {...axisProps}
              label={{ value: es.telemetry.longitudinal, angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number) => [value.toFixed(2) + 'G', '']}
            />
            <Scatter data={gForceData} fill={C.gForce} opacity={0.4} r={2} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Tyre Temperatures */}
      <div className="telemetry-chart-card telemetry-chart-wide">
        <h4>🌡️ {es.telemetry.tyreTemps}</h4>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit="°C" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Line type="monotone" dataKey="tyreTempFL" stroke={C.fl} strokeWidth={1.5} dot={false} name={es.telemetry.frontLeft} />
            <Line type="monotone" dataKey="tyreTempFR" stroke={C.fr} strokeWidth={1.5} dot={false} name={es.telemetry.frontRight} />
            <Line type="monotone" dataKey="tyreTempRL" stroke={C.rl} strokeWidth={1.5} dot={false} name={es.telemetry.rearLeft} />
            <Line type="monotone" dataKey="tyreTempRR" stroke={C.rr} strokeWidth={1.5} dot={false} name={es.telemetry.rearRight} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 6. Tyre Wear Progression */}
      <div className="telemetry-chart-card">
        <h4>📉 {es.telemetry.tyreWearChart}</h4>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit="%" domain={[0, 'auto']} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Line type="monotone" dataKey="tyreWearFL" stroke={C.fl} strokeWidth={1.5} dot={false} name={es.telemetry.frontLeft} />
            <Line type="monotone" dataKey="tyreWearFR" stroke={C.fr} strokeWidth={1.5} dot={false} name={es.telemetry.frontRight} />
            <Line type="monotone" dataKey="tyreWearRL" stroke={C.rl} strokeWidth={1.5} dot={false} name={es.telemetry.rearLeft} />
            <Line type="monotone" dataKey="tyreWearRR" stroke={C.rr} strokeWidth={1.5} dot={false} name={es.telemetry.rearRight} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 7. Brake Temperatures */}
      <div className="telemetry-chart-card">
        <h4>🔥 {es.telemetry.brakeTemps}</h4>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit="°C" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Line type="monotone" dataKey="brakeTempFL" stroke={C.fl} strokeWidth={1.5} dot={false} name={es.telemetry.frontLeft} />
            <Line type="monotone" dataKey="brakeTempFR" stroke={C.fr} strokeWidth={1.5} dot={false} name={es.telemetry.frontRight} />
            <Line type="monotone" dataKey="brakeTempRL" stroke={C.rl} strokeWidth={1.5} dot={false} name={es.telemetry.rearLeft} />
            <Line type="monotone" dataKey="brakeTempRR" stroke={C.rr} strokeWidth={1.5} dot={false} name={es.telemetry.rearRight} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 8. Fuel Consumption */}
      <div className="telemetry-chart-card">
        <h4>⛽ {es.telemetry.fuelConsumption}</h4>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit=" L" domain={[0, Math.ceil(data.maxFuel)]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="fuel"
              stroke={C.fuel}
              fill={C.fuel}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={false}
              name={es.telemetry.fuel}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 9. Steering Angle Trace */}
      <div className="telemetry-chart-card telemetry-chart-wide">
        <h4>🎮 {es.telemetry.steeringTrace}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit="°" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="steer"
              stroke={C.steering}
              fill={C.steering}
              fillOpacity={0.1}
              strokeWidth={1.5}
              dot={false}
              name={es.telemetry.steeringTrace}
              baseValue={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 10. Suspension Travel */}
      <div className="telemetry-chart-card telemetry-chart-wide">
        <h4>📐 {es.telemetry.suspensionTravel}</h4>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Line type="monotone" dataKey="suspFL" stroke={C.fl} strokeWidth={1} dot={false} name={es.telemetry.frontLeft} />
            <Line type="monotone" dataKey="suspFR" stroke={C.fr} strokeWidth={1} dot={false} name={es.telemetry.frontRight} />
            <Line type="monotone" dataKey="suspRL" stroke={C.rl} strokeWidth={1} dot={false} name={es.telemetry.rearLeft} />
            <Line type="monotone" dataKey="suspRR" stroke={C.rr} strokeWidth={1} dot={false} name={es.telemetry.rearRight} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
