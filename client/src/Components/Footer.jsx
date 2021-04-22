import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return <div className="footer">
    <div>
      <img src="PlanMyTrip1.png" alt="Plan My Trip" height="100" />
    </div>
    <div>
      <p style={{ "fontSize": "18px", "lineHeight": "2em", "float": "right" }}>
        <Link to="/about" className="nav__el">About Us</Link>
      </p>
      <p style={{ "fontSize": "18px", "lineHeight": "2em", }}>
        <Link to="/contact" className="nav__el">Contact Us</Link>
      </p>
    </div>
  </div>
}