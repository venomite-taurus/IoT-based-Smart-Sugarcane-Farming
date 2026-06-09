import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Droplets, Thermometer, Wind, History, Activity, BarChart3, CloudRain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const IDEAL_PARAMS = {
  temperature: { min: 20, max: 35, label: 'Temperature (°C)', icon: Thermometer },
  humidity: { min: 70, max: 85, label: 'Humidity (%)', icon: Wind },
  soilMoisture: { min: 60, max: 80, label: 'Soil Moisture (%)', icon: Droplets }
};

const toIST = (dateStr) => dateStr ? new Date(new Date(dateStr).getTime() + 5.5 * 60 * 60 * 1000) : null;

const Dashboard = () => {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState('All-India General');

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/data?limit=20`);
      if (!response.ok) throw new Error('Failed to fetch live data');
      const result = await response.json();
      if (result.success) {
        setLiveData(result.data);
      } else {
        throw new Error(result.error || 'Backend returned failure');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatus = (value, paramKey) => {
    const param = IDEAL_PARAMS[paramKey];
    const val = parseFloat(value);
    if (val < param.min) return 'low';
    if (val > param.max) return 'high';
    return 'ideal';
  };

  const getFeedback = (status, paramKey) => {
    if (status === 'ideal') return 'Condition is optimal.';
    if (paramKey === 'temperature') return status === 'low' ? 'Too cold. Consider using frost protection.' : 'Too hot. Ensure adequate irrigation.';
    if (paramKey === 'humidity') return status === 'low' ? 'Low humidity. Increase irrigation frequency.' : 'High humidity. Risk of fungal diseases.';
    if (paramKey === 'soilMoisture') return status === 'low' ? 'Dry soil. Immediate irrigation required.' : 'Waterlogged. Improve drainage.';
    return '';
  };

  const renderCard = (paramKey, value) => {
    const param = IDEAL_PARAMS[paramKey];
    const status = getStatus(value, paramKey);
    const Icon = param.icon;
    
    let statusClass = 'status-ideal';
    let StatusIcon = CheckCircle;
    
    if (status !== 'ideal') {
      statusClass = status === 'low' ? 'status-warning' : 'status-danger';
      StatusIcon = AlertTriangle;
    }

    return (
      <div className={`metric-card ${statusClass}`}>
        <div className="metric-header">
          <div className="metric-icon"><Icon size={24} /></div>
          <h4>{param.label}</h4>
        </div>
        <div className="metric-value">{value}</div>
        <div className="metric-feedback">
          <StatusIcon size={16} />
          <span>{getFeedback(status, paramKey)}</span>
        </div>
        <div className="ideal-range">Ideal: {param.min} - {param.max}</div>
      </div>
    );
  };

  const renderRainCard = (rainValue) => {
    const isRaining = rainValue === 1;
    const statusClass = isRaining ? 'status-ideal' : 'status-warning';
    
    return (
      <div className={`metric-card ${statusClass}`}>
        <div className="metric-header">
          <div className="metric-icon"><CloudRain size={24} /></div>
          <h4>Rain Status</h4>
        </div>
        <div className="metric-value">{isRaining ? 'Raining' : 'No Rain'}</div>
        <div className="metric-feedback">
          {isRaining ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{isRaining ? 'Precipitation detected.' : 'Clear conditions.'}</span>
        </div>
        <div className="ideal-range">Status: 0 / 1</div>
      </div>
    );
  };

  // Get most recent reading
  const currentData = liveData.length > 0 ? liveData[0] : null;

  // Prepare chart data (reverse to show chronological order left to right)
  const chartData = [...liveData].reverse().slice(-20).map((item, index) => ({
    name: toIST(item.created_at).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    Temperature: parseFloat(item.temperature),
    Humidity: parseFloat(item.humidity),
    'Soil Moisture': parseFloat(item.soil_moisture)
  }));

  return (
    <section id="dashboard" className="dashboard-section">
      <div className="container">
        <div className="dashboard-header">
          <h2>Live Sensor Dashboard</h2>
          <p>Real-time data monitoring from your ESP32 IoT Node.</p>
        </div>

        <div className="region-selector" style={{marginBottom: '2rem'}}>
          <label>Region for ideal-range comparison:</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option>All-India General</option>
            <option>Maharashtra (Deccan)</option>
            <option>Uttar Pradesh (Plains)</option>
            <option>Tamil Nadu</option>
          </select>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '3rem'}}>
            <Activity size={48} className="spin" style={{color: 'var(--primary-color)', margin: '0 auto'}}/>
            <p style={{marginTop: '1rem'}}>Connecting to live sensors...</p>
          </div>
        ) : error ? (
          <div style={{textAlign: 'center', padding: '3rem', color: 'red'}}>
            <AlertTriangle size={48} style={{margin: '0 auto'}}/>
            <p style={{marginTop: '1rem'}}>Error: {error}</p>
          </div>
        ) : liveData.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem'}}>
            <p>No sensor data found. Please ensure the ESP32 is transmitting data.</p>
          </div>
        ) : (
          <div className="dashboard-content animate-fade-in">
            <div className="results-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3>Latest Reading: {currentData.node || "ESP32 Node 1"}</h3>
                <p className="text-sm" style={{color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                  Region: {region} | Last updated: {toIST(currentData.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontWeight: 'bold'}}>
                <Activity size={20} className="pulse" /> Live
              </div>
            </div>
            
            <div className="metrics-grid">
              {renderCard('temperature', currentData.temperature)}
              {renderCard('humidity', currentData.humidity)}
              {renderCard('soilMoisture', currentData.soil_moisture)}
              {renderRainCard(currentData.rain)}
            </div>

            {/* CHART SECTION */}
            <div className="chart-section mt-12">
              <div className="history-header">
                <BarChart3 size={20} />
                <h3>Live Trend Analysis (Last 20 Readings)</h3>
              </div>
              <div className="chart-container" style={{ width: '100%', height: 400, backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}
                      itemStyle={{fontWeight: 600}}
                    />
                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                    <Line type="monotone" dataKey="Temperature" name="Temperature (°C)" stroke="#f57f17" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Soil Moisture" name="Soil Moisture (%)" stroke="#2e7d32" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="history-section mt-12">
              <div className="history-header">
                <History size={20} />
                <h3>Recent Readings (Last {Math.min(liveData.length, 5)})</h3>
              </div>
              <div className="history-list">
                {liveData.slice(0, 5).map((item, index) => (
                  <div key={item.id} className={`history-item ${index === 0 ? 'current' : ''}`}>
                    <div className="history-info">
                      <Activity size={20} className="history-icon" />
                      <div>
                        <h4>{item.node || "ESP32 Node 1"} {index === 0 && <span className="badge-new">LIVE</span>}</h4>
                        <span>{toIST(item.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                      </div>
                    </div>
                    <div className="history-metrics">
                      <span><Thermometer size={14}/> {item.temperature}°C</span>
                      <span><Wind size={14}/> {item.humidity}%</span>
                      <span><Droplets size={14}/> {item.soil_moisture}%</span>
                      <span><CloudRain size={14}/> {item.rain === 1 ? 'Rain' : 'No Rain'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
