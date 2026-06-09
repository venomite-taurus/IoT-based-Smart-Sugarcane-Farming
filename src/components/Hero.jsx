import React from 'react';
import { BarChart3, ChevronRight, Sprout } from 'lucide-react';
import './Hero.css';

const Hero = ({ onViewIot }) => {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <div className="hero-badge animate-fade-in">
          <Sprout size={16} />
          <span>Powered by precision agriculture</span>
        </div>
        
        <h1 className="hero-title animate-fade-in delay-100">
          Smart Sugarcane <span className="text-gradient">Farming<br/>System</span>
        </h1>
        
        <p className="hero-subtitle animate-fade-in delay-200">
          Monitor temperature, humidity and soil moisture across India's sugarcane
          belts. Upload your field data and get instant, region-aware
          recommendations.
        </p>
        
        <div className="hero-actions animate-fade-in delay-300">
          <a href="#dashboard" className="btn btn-primary">
            <BarChart3 size={20} />
            Analyze Field Data
          </a>
          <button className="btn btn-outline" onClick={onViewIot}>
            Live IoT Monitor
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
