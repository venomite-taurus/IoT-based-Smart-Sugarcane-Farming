import React, { useState, useEffect } from "react";
import { Activity, AlertTriangle, Sun, Moon } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";

// ─── Initial State ─────────────────────────────────────────────────────────────
const INITIAL_NODES = {
  node_1: {
    label: "Node 1 — North Field",
    color: "#4ade80",
    location: "Block A, Row 1–12",
    soil_moisture: null,
    temperature: null,
    humidity: null,
    rain: null,
    last_updated: null,
    history: { soil_moisture: [], temperature: [], humidity: [] },
  },
  node_2: {
    label: "Node 2 — Central Field",
    color: "#facc15",
    location: "Block B, Row 13–24",
    soil_moisture: null,
    temperature: null,
    humidity: null,
    rain: null,
    last_updated: null,
    history: { soil_moisture: [], temperature: [], humidity: [] },
  },
  node_3: {
    label: "Node 3 — South Field",
    color: "#38bdf8",
    location: "Block C, Row 25–36",
    soil_moisture: null,
    temperature: null,
    humidity: null,
    rain: null,
    last_updated: null,
    history: { soil_moisture: [], temperature: [], humidity: [] },
  },
};

// ─── Utilities ─────────────────────────────────────────────────────────────────
const getStatus = (node) => {
  if (node.soil_moisture == null || node.temperature == null || node.humidity == null || node.rain == null) {
    return { label: "Waiting for data", color: "var(--text-subtitle)" };
  }
  if (node.soil_moisture < 40) return { label: "⚠ Low Moisture", color: "#f97316" };
  if (node.soil_moisture > 80) return { label: "⚠ High Moisture", color: "#ef4444" };
  if (node.temperature > 33) return { label: "🌡 Heat Stress", color: "#ef4444" };
  if (node.temperature < 20) return { label: "❄️ Cold Stress", color: "#38bdf8" };
  if (node.humidity > 85) return { label: "🦠 Disease Risk", color: "#a78bfa" };
  if (node.humidity < 50) return { label: "🌬️ Dry Air", color: "#facc15" };
  if (node.rain === 1) return { label: "🌧 Raining", color: "#38bdf8" };
  return { label: "✓ Optimal", color: "#4ade80" };
};

const formatSensorValue = (value, unit = '') => value == null ? '--' : `${value}${unit}`;


// ─── Gauge Component ──────────────────────────────────────────────────────────
const Gauge = ({ value, max, label, unit, color }) => {
  const pct = typeof value === 'number' ? Math.min(value / max, 1) : 0;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ * 0.75;
  const gap = circ - dash;
  const rotate = -135;
  const labelValue = formatSensorValue(value, unit);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={100} height={80} viewBox="0 0 100 80">
        <circle cx={50} cy={58} r={r} fill="none" stroke="var(--border-main)" strokeWidth={8}
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round" transform={`rotate(${rotate} 50 58)`} />
        <circle cx={50} cy={58} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${gap + circ * 0.25}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round" transform={`rotate(${rotate} 50 58)`}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)`, transition: "stroke-dasharray 1s ease" }} />
        <text x={50} y={55} textAnchor="middle" fill="var(--text-title)" fontSize={14} fontWeight="700"
          fontFamily="'DM Mono', monospace">{labelValue}</text>
      </svg>
      <span style={{ fontSize: 11, color: "var(--text-label)", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>{label}</span>
    </div>
  );
};

// ─── Mini Sparkline ────────────────────────────────────────────────────────────
const Spark = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={50}>
    <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
        fill={`url(#sg-${color})`} dot={false} connectNulls={true} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Node Card (Overview) ─────────────────────────────────────────────────────
const NodeCard = ({ id, node, selected, onClick }) => {
  const status = getStatus(node);
  return (
    <div onClick={() => onClick(id)} style={{
      background: selected ? "var(--bg-card-selected)" : "var(--bg-card)",
      border: `1.5px solid ${selected ? node.color : "var(--border-main)"}`,
      borderRadius: 16, padding: "20px 22px", cursor: "pointer",
      transition: "all 0.25s ease",
      boxShadow: selected ? `0 0 24px ${node.color}33` : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-subtitle)", letterSpacing: 2, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>
            {id.toUpperCase()}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "'Outfit', sans-serif" }}>
            {node.label}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{node.location}</div>
        </div>
        <span style={{
          background: status.color + "22", color: status.color,
          fontSize: 11, padding: "4px 10px", borderRadius: 99,
          fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap"
        }}>{status.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { label: "SOIL", value: node.soil_moisture, unit: "%", color: "#a78bfa" },
          { label: "TEMP", value: node.temperature, unit: "°C", color: "#f97316" },
          { label: "HUMID", value: node.humidity, unit: "%", color: "#38bdf8" },
          { label: "RAIN", value: node.rain == null ? null : node.rain ? "YES" : "NO", unit: "", color: node.rain ? "#38bdf8" : "var(--text-subtitle)" },
        ].map(m => (
          <div key={m.label} style={{
            background: "var(--bg-inner)", borderRadius: 10, padding: "10px 14px",
            borderLeft: `3px solid ${m.color}`
          }}>
            <div style={{ fontSize: 10, color: "var(--text-subtitle)", letterSpacing: 1, marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: m.color, fontFamily: "'DM Mono', monospace" }}>
              {formatSensorValue(m.value, m.unit)}
            </div>
          </div>
        ))}
      </div>

      <Spark data={node.history.soil_moisture} color={node.color} />
      <div style={{ fontSize: 10, color: "var(--border-light)", textAlign: "right", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>soil moisture · 24h</div>
    </div>
  );
};

// ─── Detail Chart ──────────────────────────────────────────────────────────────
const DetailChart = ({ data, color, label, unit, yDomain }) => (
  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 14, padding: "18px 20px" }}>
    <div style={{ fontSize: 12, color: "var(--text-subtitle)", letterSpacing: 2, marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>{label}</div>
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" />
        <XAxis dataKey="time" tick={{ fill: "var(--text-muted)", fontSize: 10 }} interval={3} />
        <YAxis domain={yDomain} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: "var(--bg-inner)", border: `1px solid ${color}55`, borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
          labelStyle={{ color: "var(--text-label)" }}
          itemStyle={{ color }}
          formatter={(v) => [`${v}${unit}`, label]}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
          fill={`url(#grad-${label})`} dot={false} connectNulls={true}
          activeDot={{ r: 5, fill: color, stroke: "var(--bg-card)", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ─── Node Detail View ─────────────────────────────────────────────────────────
const NodeDetail = ({ id, node }) => {
  const status = getStatus(node);
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: node.color + "22", border: `2px solid ${node.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20
        }}>🌾</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-title)", fontFamily: "'Outfit', sans-serif" }}>{node.label}</div>
          <div style={{ fontSize: 13, color: "var(--text-subtitle)" }}>
            {node.location} · Last updated: {node.last_updated ? node.last_updated.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Waiting for data..."}
          </div>
        </div>
        <span style={{
          marginLeft: "auto", background: status.color + "22", color: status.color,
          fontSize: 12, padding: "6px 14px", borderRadius: 99, fontFamily: "'DM Mono', monospace"
        }}>{status.label}</span>
      </div>

      {/* Gauges */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 16,
        padding: "24px", marginBottom: 20, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16
      }}>
        <Gauge value={node.soil_moisture} max={100} label="SOIL MOISTURE" unit="%" color="#a78bfa" />
        <Gauge value={node.temperature} max={50} label="TEMPERATURE" unit="°C" color="#f97316" />
        <Gauge value={node.humidity} max={100} label="HUMIDITY" unit="%" color="#38bdf8" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: node.rain === 1 ? "#38bdf822" : "var(--border-main)",
            border: `3px solid ${node.rain === 1 ? "#38bdf8" : "var(--border-light)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
            boxShadow: node.rain === 1 ? "0 0 20px #38bdf855" : "none"
          }}>{node.rain == null ? "--" : node.rain ? "🌧" : "☀️"}</div>
          <span style={{ fontSize: 11, color: "var(--text-label)", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>RAIN STATUS</span>
          <span style={{ fontSize: 13, color: node.rain === 1 ? "#38bdf8" : "var(--text-subtitle)", fontWeight: 700 }}>
            {node.rain == null ? '--' : node.rain ? "ACTIVE" : "NONE"}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <DetailChart data={node.history.soil_moisture} color="#a78bfa" label="SOIL MOISTURE · 24H" unit="%" yDomain={[0, 100]} />
        <DetailChart data={node.history.temperature} color="#f97316" label="TEMPERATURE · 24H" unit="°C" yDomain={[20, 45]} />
      </div>
      <DetailChart data={node.history.humidity} color="#38bdf8" label="HUMIDITY · 24H" unit="%" yDomain={[30, 100]} />

      {/* Recommendations */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 14, padding: 20, marginTop: 20 }}>
        <div style={{ fontSize: 12, color: "var(--text-subtitle)", letterSpacing: 2, marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>SMART RECOMMENDATIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {node.soil_moisture < 40 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#f9731611", borderRadius: 10, padding: "12px 16px", border: "1px solid #f9731633" }}>
              <span>💧</span>
              <div>
                <div style={{ color: "#f97316", fontWeight: 700, fontSize: 13 }}>Irrigation Required (Low Moisture)</div>
                <div style={{ color: "var(--text-label)", fontSize: 12, marginTop: 2 }}>Soil moisture at {node.soil_moisture}% — below optimal threshold of 50%. Start drip irrigation cycle.</div>
              </div>
            </div>
          )}
          {node.soil_moisture > 80 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#ef444411", borderRadius: 10, padding: "12px 16px", border: "1px solid #ef444433" }}>
              <span>🌊</span>
              <div>
                <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 13 }}>Waterlogging Alert (High Moisture)</div>
                <div style={{ color: "var(--text-label)", fontSize: 12, marginTop: 2 }}>Soil moisture at {node.soil_moisture}% — above optimal threshold of 80%. Stop irrigation and check field drainage to prevent root rot.</div>
              </div>
            </div>
          )}
          {node.temperature < 20 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#38bdf811", borderRadius: 10, padding: "12px 16px", border: "1px solid #38bdf833" }}>
              <span>❄️</span>
              <div>
                <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: 13 }}>Cold Stress Alert (Low Temp)</div>
                <div style={{ color: "var(--text-label)", fontSize: 12, marginTop: 2 }}>Temperature at {node.temperature}°C. Can slow down germination and growth. Avoid evening watering and monitor for frost if dropping further.</div>
              </div>
            </div>
          )}
          {node.temperature > 33 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#ef444411", borderRadius: 10, padding: "12px 16px", border: "1px solid #ef444433" }}>
              <span>🌡</span>
              <div>
                <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 13 }}>Heat Stress Alert (High Temp)</div>
                <div style={{ color: "var(--text-label)", fontSize: 12, marginTop: 2 }}>Temperature at {node.temperature}°C. Consider afternoon shading or increased watering frequency to maintain microclimate.</div>
              </div>
            </div>
          )}
          {node.humidity < 50 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#facc1511", borderRadius: 10, padding: "12px 16px", border: "1px solid #facc1533" }}>
              <span>🌬️</span>
              <div>
                <div style={{ color: "#facc15", fontWeight: 700, fontSize: 13 }}>Dry Air Alert (Low Humidity)</div>
                <div style={{ color: "var(--text-label)", fontSize: 12, marginTop: 2 }}>Humidity at {node.humidity}%. High evaporation expected; monitor soil moisture closely and adjust irrigation schedules.</div>
              </div>
            </div>
          )}
          {node.humidity > 85 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#a78bfa11", borderRadius: 10, padding: "12px 16px", border: "1px solid #a78bfa33" }}>
              <span>🦠</span>
              <div>
                <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>Disease Risk (High Humidity)</div>
                <div style={{ color: "var(--text-label)", fontSize: 12, marginTop: 2 }}>Humidity at {node.humidity}%. High risk of fungal diseases (e.g., Red Rot). Ensure good field aeration and monitor crop health.</div>
              </div>
            </div>
          )}
          {node.soil_moisture >= 40 && node.soil_moisture <= 80 && node.temperature >= 20 && node.temperature <= 33 && node.humidity >= 50 && node.humidity <= 85 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#4ade8011", borderRadius: 10, padding: "12px 16px", border: "1px solid #4ade8033" }}>
              <span>✅</span>
              <div>
                <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 13 }}>Conditions Optimal</div>
                <div style={{ color: "var(--text-label)", fontSize: 12, marginTop: 2 }}>All parameters within healthy range for sugarcane growth. No action required.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Overview All Nodes ────────────────────────────────────────────────────────
const Overview = ({ nodes }) => {
  const timeMap = {};
  [nodes.node_1, nodes.node_2, nodes.node_3].forEach((node, index) => {
    const nodeKey = `node_${index + 1}`;
    if (node.history && node.history.soil_moisture) {
      node.history.soil_moisture.forEach(point => {
        if (!timeMap[point.time]) {
          timeMap[point.time] = { time: point.time, timestamp: point.timestamp };
        }
        timeMap[point.time][nodeKey] = point.value;
      });
    }
  });
  const compData = Object.values(timeMap).sort((a, b) => a.timestamp - b.timestamp);

  const sensorNodes = [nodes.node_1, nodes.node_2, nodes.node_3];
  const moistureValues = sensorNodes.map(n => n.soil_moisture).filter((value) => value != null);
  const tempValues = sensorNodes.map(n => n.temperature).filter((value) => value != null);
  const avgMoisture = moistureValues.length ? (moistureValues.reduce((sum, value) => sum + value, 0) / moistureValues.length).toFixed(0) : '--';
  const avgTemp = tempValues.length ? (tempValues.reduce((sum, value) => sum + value, 0) / tempValues.length).toFixed(1) : '--';
  const activeAlerts = Object.values(nodes).filter(n => (n.soil_moisture != null && (n.soil_moisture < 40 || n.soil_moisture > 80)) || (n.temperature != null && (n.temperature > 33 || n.temperature < 20)) || (n.humidity != null && (n.humidity < 50 || n.humidity > 85))).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-title)", fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
          Farm Overview
        </div>
        <div style={{ color: "var(--text-subtitle)", fontSize: 14 }}>All 3 nodes · Live monitoring · Sugarcane Field</div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "ACTIVE NODES", value: "3 / 3", color: "#4ade80", icon: "📡" },
          { label: "AVG MOISTURE", value: `${avgMoisture}%`, color: "#a78bfa", icon: "💧" },
          { label: "AVG TEMP", value: `${avgTemp}°C`, color: "#f97316", icon: "🌡" },
          { label: "ALERTS", value: `${activeAlerts} Active`, color: "#ef4444", icon: "⚠" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg-card)", border: `1px solid ${s.color}33`, borderRadius: 14,
            padding: "18px 20px",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: "var(--text-subtitle)", letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "var(--text-subtitle)", letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
          SOIL MOISTURE COMPARISON · ALL NODES
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
          {Object.entries(nodes).map(([id, n]) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 3, borderRadius: 2, background: n.color }} />
              <span style={{ fontSize: 11, color: "var(--text-label)", fontFamily: "'DM Mono', monospace" }}>{n.label}</span>
            </div>
          ))}
        </div>
        {compData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={compData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" />
              <XAxis dataKey="time" tick={{ fill: "var(--text-muted)", fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "var(--bg-inner)", border: "1px solid var(--border-light)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
                labelStyle={{ color: "var(--text-label)" }}
              />
              {Object.entries(nodes).map(([id, n]) => (
                <Line key={id} name={n.label} type="monotone" dataKey={id} stroke={n.color} strokeWidth={2} dot={false}
                  activeDot={{ r: 4, stroke: n.color, fill: "var(--bg-card)" }} connectNulls={true} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: "var(--text-subtitle)", textAlign: "center", padding: "40px 0", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>No history data available yet.</div>
        )}
      </div>

      {/* Node status table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-main)" }}>
          <div style={{ fontSize: 12, color: "var(--text-subtitle)", letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>NODE STATUS TABLE</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-sidebar)" }}>
              {["NODE", "LOCATION", "SOIL %", "TEMP °C", "HUMIDITY %", "RAIN", "STATUS"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(nodes).map(([id, n]) => {
              const status = getStatus(n);
              return (
                <tr key={id} style={{ borderTop: "1px solid var(--border-main)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, boxShadow: `0 0 6px ${n.color}` }} />
                      <span style={{ color: n.color, fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700 }}>{n.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--text-label)", fontSize: 13 }}>{n.location}</td>
                  <td style={{ padding: "14px 20px", color: "#a78bfa", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{formatSensorValue(n.soil_moisture, '%')}</td>
                  <td style={{ padding: "14px 20px", color: "#f97316", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{formatSensorValue(n.temperature, '°C')}</td>
                  <td style={{ padding: "14px 20px", color: "#38bdf8", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{formatSensorValue(n.humidity, '%')}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ color: n.rain === 1 ? "#38bdf8" : "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                      {n.rain == null ? '--' : n.rain ? "🌧 Yes" : "☀ No"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: status.color + "22", color: status.color, fontSize: 11, padding: "4px 10px", borderRadius: 99, fontFamily: "'DM Mono', monospace" }}>{status.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const toIST = (dateStr) => dateStr ? new Date(new Date(dateStr).getTime() + 5.5 * 60 * 60 * 1000) : null;

export default function IotMonitor() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [activeView, setActiveView] = useState("overview");
  const [time, setTime] = useState(null);
  const [nodesData, setNodesData] = useState(INITIAL_NODES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const nodeIds = ['node1', 'node2', 'node3'];
        const latestPromises = nodeIds.map((nodeId) =>
          fetch(`${API_BASE}/api/data/latest?node=${encodeURIComponent(nodeId)}`)
            .then(async (res) => {
              const json = await res.json();
              if (!res.ok || !json.success) {
                console.warn(`Failed to load latest data for ${nodeId}`);
                return null;
              }
              return json.data;
            })
            .catch((e) => {
              console.warn(`Error fetching latest for ${nodeId}:`, e);
              return null;
            })
        );

        const historyPromises = nodeIds.map((nodeId) =>
          fetch(`${API_BASE}/api/data?limit=24&node=${encodeURIComponent(nodeId)}`)
            .then(async (res) => {
              const json = await res.json();
              if (!res.ok || !json.success) return [];
              return json.data;
            })
            .catch((e) => {
              console.warn(`Error fetching history for ${nodeId}:`, e);
              return [];
            })
        );

        const [latestRecords, historyResults] = await Promise.all([
          Promise.all(latestPromises),
          Promise.all(historyPromises)
        ]);

        const newNodesData = JSON.parse(JSON.stringify(INITIAL_NODES));
        let mostRecentTimestamp = null;

        nodeIds.forEach((dbNodeId, index) => {
          const frontendNodeId = `node_${index + 1}`;
          const latest = latestRecords[index];
          const nodeHistory = (Array.isArray(historyResults[index]) ? historyResults[index] : [])
            .sort((a, b) => toIST(a.created_at) - toIST(b.created_at));

          if (latest) {
            newNodesData[frontendNodeId].soil_moisture = latest.soil_moisture != null ? Number(latest.soil_moisture) : null;
            newNodesData[frontendNodeId].temperature = latest.temperature != null ? Number(latest.temperature) : null;
            newNodesData[frontendNodeId].humidity = latest.humidity != null ? Number(latest.humidity) : null;
            newNodesData[frontendNodeId].rain = latest.rain != null ? latest.rain : null;
            newNodesData[frontendNodeId].last_updated = latest.created_at ? toIST(latest.created_at) : null;

            const latestTime = toIST(latest.created_at);
            if (!mostRecentTimestamp || latestTime > mostRecentTimestamp) {
              mostRecentTimestamp = latestTime;
            }
          }

          newNodesData[frontendNodeId].history.soil_moisture = nodeHistory.map((d) => ({
            time: toIST(d.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
            timestamp: toIST(d.created_at).getTime(),
            value: d.soil_moisture != null ? Number(d.soil_moisture) : null,
          }));
          newNodesData[frontendNodeId].history.temperature = nodeHistory.map((d) => ({
            time: toIST(d.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
            timestamp: toIST(d.created_at).getTime(),
            value: d.temperature != null ? Number(d.temperature) : null,
          }));
          newNodesData[frontendNodeId].history.humidity = nodeHistory.map((d) => ({
            time: toIST(d.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
            timestamp: toIST(d.created_at).getTime(),
            value: d.humidity != null ? Number(d.humidity) : null,
          }));
        });

        setTime(mostRecentTimestamp);
        setNodesData(newNodesData);
      } catch (e) {
        console.error('Error fetching data:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);



  const navItems = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "node_1", label: "Node 1", icon: "◉" },
    { id: "node_2", label: "Node 2", icon: "◉" },
    { id: "node_3", label: "Node 3", icon: "◉" },
  ];

  return (
    <div className={`iot-container ${isDarkMode ? "dark" : "light"}`} style={{
      minHeight: "100vh",
      background: "var(--bg-app)",
      color: "var(--text-title)",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .iot-container {
          --bg-app: #070b10;
          --bg-sidebar: #0a0f14;
          --bg-card: #0d1117;
          --bg-card-selected: #0f2a1a;
          --bg-inner: #161d26;
          --border-main: #1e293b;
          --border-light: #334155;
          --text-title: white;
          --text-subtitle: #64748b;
          --text-label: #94a3b8;
          --text-muted: #475569;
        }
        .iot-container.light {
          --bg-app: #f8fafc;
          --bg-sidebar: #ffffff;
          --bg-card: #ffffff;
          --bg-card-selected: #f0fdf4;
          --bg-inner: #f1f5f9;
          --border-main: #e2e8f0;
          --border-light: #cbd5e1;
          --text-title: #0f172a;
          --text-subtitle: #64748b;
          --text-label: #475569;
          --text-muted: #94a3b8;
        }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg-card); }
        ::-webkit-scrollbar-thumb { background: var(--border-main); border-radius: 3px; }
        .nav-item { transition: all 0.2s ease; }
        .nav-item:hover { background: var(--bg-card-selected) !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{
          width: 220, background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-main)",
          display: "flex", flexDirection: "column",
          flexShrink: 0
        }}>
          {/* Logo */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border-main)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 24 }}>🌾</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-title)", lineHeight: 1.2 }}>CaneWatch</div>
                <div style={{ fontSize: 10, color: "#4ade80", letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>IOT MONITOR</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "16px 12px", flex: 1 }}>
            <div style={{ fontSize: 10, color: "var(--border-light)", letterSpacing: 2, padding: "0 8px", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>DASHBOARD</div>
            {navItems.map(item => {
              const active = activeView === item.id;
              const nodeColor = item.id !== "overview" ? nodesData[item.id]?.color : "#4ade80";
              return (
                <button key={item.id} className="nav-item"
                  onClick={() => setActiveView(item.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: active ? "var(--bg-card-selected)" : "transparent",
                    color: active ? nodeColor : "var(--text-subtitle)",
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: active ? 700 : 400,
                    marginBottom: 4, textAlign: "left"
                  }}>
                  <span style={{ color: active ? nodeColor : "var(--border-light)", fontSize: 12 }}>{item.icon}</span>
                  {item.label}
                  {item.id !== "overview" && (
                    <span style={{
                      marginLeft: "auto", width: 7, height: 7, borderRadius: "50%",
                      background: nodeColor, boxShadow: `0 0 5px ${nodeColor}`
                    }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Clock */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-main)" }}>
            <div style={{ fontSize: 10, color: "var(--border-light)", letterSpacing: 2, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>LAST SYNC</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>
              {time ? time.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              {time ? time.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }) : "Waiting for data"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 32 }}>
            <div style={{ textAlign: "center", color: "var(--text-label)" }}>
              <Activity size={48} className="spin" style={{ color: "#4ade80" }} />
              <h2 style={{ marginTop: 16, color: "var(--text-title)" }}>Waiting for ESP32 sensor data...</h2>
              <p style={{ marginTop: 8, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                No sample or static values will be shown. Only actual ESP32 readings from the backend will appear here.
              </p>
            </div>
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 32 }}>
            <div style={{ textAlign: "center", color: "#f97316" }}>
              <AlertTriangle size={48} style={{ color: "#f97316" }} />
              <h2 style={{ marginTop: 16, color: "var(--text-title)" }}>Unable to load ESP32 data</h2>
              <p style={{ marginTop: 8, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                {error}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: "auto" }}>
            {/* Top Bar */}
            <div style={{
              padding: "16px 32px", borderBottom: "1px solid var(--border-main)",
              background: "var(--bg-sidebar)", display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, zIndex: 10
            }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              {activeView === "overview" ? "/ overview" : `/ nodes / ${activeView}`}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                style={{ 
                  background: "var(--bg-inner)", 
                  border: "1px solid var(--border-main)", 
                  padding: "6px 12px", 
                  borderRadius: "8px", 
                  color: "var(--text-title)", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  marginRight: "12px"
                }}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              <span style={{ background: "#4ade8022", color: "#4ade80", fontSize: 11, padding: "4px 12px", borderRadius: 99, fontFamily: "'DM Mono', monospace" }}>
                ● 3 nodes online
              </span>
              <span style={{ background: "#f9731622", color: "#f97316", fontSize: 11, padding: "4px 12px", borderRadius: 99, fontFamily: "'DM Mono', monospace" }}>
                ⚠ {Object.values(nodesData).filter(n => n.soil_moisture != null && (n.soil_moisture < 40 || n.soil_moisture > 80) || n.temperature != null && (n.temperature > 33 || n.temperature < 20) || n.humidity != null && (n.humidity < 50 || n.humidity > 85)).length} alerts
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "32px" }}>
            {activeView === "overview" ? (
              <Overview nodes={nodesData} />
            ) : (
              <>
                <NodeDetail id={activeView} node={nodesData[activeView]} />
                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {Object.entries(nodesData).filter(([id]) => id !== activeView).map(([id, n]) => (
                    <NodeCard key={id} id={id} node={n} selected={false} onClick={setActiveView} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Overview Node Cards */}
          {activeView === "overview" && (
            <div style={{ padding: "0 32px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {Object.entries(nodesData).map(([id, node]) => (
                <NodeCard key={id} id={id} node={node} selected={false} onClick={setActiveView} />
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
