import React, { useEffect } from 'react';

export default function Contact() {
  useEffect(() => { window.scrollTo(0, 0); });

  return <div className="contact-view content">
    <img src="contact.png" style={{ "float": "left", "width": "50%", "height": "100%" }} alt=""/>
    <div className="contact-right">
      <h1 className="heading-secondary" style={{ "color": "#D1FFF5" }}>Reach Out!</h1>
      <br />
      <br />
      <br />
      <p className="contact-right-text">Mailing Address</p>
      <p className="contact-right-detail">123 Anywhere St., Any City, State, Country 123456</p>
      <br />
      <br />
      <p className="contact-right-text">Email Address</p>
      <p className="contact-right-detail">info@planmytrip.com</p>
      <br />
      <br />
      <p className="contact-right-text">Phone Number</p>
      <p className="contact-right-detail">123-456-7890</p>
    </div>
  </div>
}