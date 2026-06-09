import React from 'react';
import './Gallery.css';

const Gallery = () => {
  const images = [
    {
      title: 'Healthy Stalks',
      desc: 'Tall, fibrous canes ready for harvest.',
      src: 'healthy_stalks_1776968225828.png', 
    },
    {
      title: 'Farmer Care',
      desc: 'Generations of expertise meet smart sensors.',
      src: 'farmer_care_1776968241638.png',
    },
    {
      title: 'Plantation Rows',
      desc: 'Aerial precision for every acre.',
      src: 'plantation_rows_1776968257931.png',
    }
  ];

  return (
    <section className="gallery-section">
      <div className="container">
        <div className="gallery-header">
          <h2 className="gallery-title">India's Sweetest Crop</h2>
          <p className="gallery-subtitle">From Maharashtra's deccan to UP's plains — sugarcane fuels millions. Smart monitoring keeps it thriving.</p>
        </div>
        
        <div className="gallery-grid">
          {images.map((img, index) => (
            <div key={index} className="gallery-card">
              <div className="gallery-img-wrapper">
                <img src={`/${img.src}`} alt={img.title} className="gallery-img" id={`img-${index}`} />
              </div>
              <div className="gallery-card-content">
                <h3>{img.title}</h3>
                <p>{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
