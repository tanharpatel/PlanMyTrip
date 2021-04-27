import React from 'react';

export default function AddTour() {
  return <div className="login-form content">
    <h2 className="heading-secondary ma-bt-lg">Add New Tour</h2>
    <form className="form">
      <div className="form__group">
        <label className="form__label" htmlFor="email">Tour Name</label>
        <input
          className="form__input"
          id="name"
          name="name"
          placeholder="Plan My Trip"
          required="required"
          type="text"
        />
      </div>
      <div className="form__group ma-bt-md">
        <label className="form__label" htmlFor="password">Summary</label>
        <textarea
          rows="2"
          id="summary"
          name="summary"
          className="form__input"
          placeholder="Your message here..."
          required="required"
        />
      </div>
      <div className="form__group ma-bt-md">
        <label className="form__label" htmlFor="password">Description</label>
        <textarea
          rows="5"
          id="description"
          name="description"
          className="form__input"
          placeholder="Your message here..."
          required="required"
        />
      </div>
      <div className="form__group">
        <button className="btn btn--blue">Add</button>
      </div>
    </form>
  </div>
}