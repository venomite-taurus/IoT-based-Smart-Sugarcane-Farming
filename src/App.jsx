import React, { useState } from 'react';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import IotMonitor from './components/IotMonitor';
import './index.css';

function App() {
  const [view, setView] = useState('landing');

  if (view === 'iot') {
    return (
      <>
        <button 
          onClick={() => setView('landing')} 
          style={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999, 
            padding: '8px 16px', 
            background: '#4ade80', 
            color: 'black', 
            border: 'none', 
            borderRadius: 8, 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          Back to Landing
        </button>
        <IotMonitor />
      </>
    );
  }

  return (
    <div className="app">
      <Hero onViewIot={() => setView('iot')} />
      <Gallery />
      <Dashboard />
      <Chatbot />
    </div>
  );
}

export default App;
