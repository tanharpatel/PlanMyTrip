import React, { useEffect } from 'react';

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); });

  return <div className="user-view content">
    <div className="user-view__content">
      <div className="user-view__form-container">
        <img className="about" src="about.png" alt=""/>
        <h2 className="about-text content">Get Your tour perfectly planned</h2>
        <h3 className="about-text content" style={{ "float": "right" }}>-Key to Travel!!!</h3>
        <div className="form__group right">
          <img className="content" src="1_t.png" alt="Plan My Trip" style={{ "position": "absolute", "right": 0, "bottom": 0 }} />
        </div>
      </div>
    </div>
  </div>
}