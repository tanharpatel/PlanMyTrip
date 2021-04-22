import React from 'react';

export default function ContactForm() {
  return <div className="login-form content">
    <h2 className="heading-secondary ma-bt-lg">Tell Us your Query</h2>
    <form className="form">
      <div className="form__group">
        <label className="form__label" htmlFor="email">Your name</label>
        <input
          className="form__input"
          id="name"
          placeholder="Plan My Trip"
          required="required"
          type="text"
        />
      </div>
      <div className="form__group">
        <label className="form__label" htmlFor="email">Email address</label>
        <input
          className="form__input"
          id="email"
          placeholder="you@provider.com"
          required="required"
          type="email"
        />
      </div>
      <div className="form__group">
        <label className="form__label" htmlFor="email">Subject</label>
        <input
          className="form__input"
          id="name"
          placeholder="Your Subject"
          required="required"
          type="text"
        />
      </div>
      <div className="form__group ma-bt-md">
        <label className="form__label" htmlFor="password">Message</label>
        <textarea
          rows="5"
          className="form__input"
          placeholder="Your message here..."
          required="required"
        />
      </div>
      <div className="form__group">
        <button className="btn btn--blue">Send</button>
      </div>
    </form>
  </div>
}