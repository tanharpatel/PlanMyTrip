import React, { useState } from "react";
import axios from 'axios';
import { PopupboxContainer } from 'react-popupbox';

export default function ForgotPassword(props) {
  const [input, setInput] = useState({ email: "" })

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInput((prevInput) => {
      return {
        ...prevInput,
        [name]: value,
      };
    });
  }

  const sendEmail = async (event) => {
    event.preventDefault();
    if (input.email === "") {
      props.openPopupbox("Email can't be empty!");
    } else {
      props.openPopupbox("Processing... Please wait a while!");
      try {
        const data = {
          email: input.email,
        };
        await axios.post("http://localhost:5000/api/v1/users/forgotPassword", data);
        props.openPopupbox("Check your mail, you can reset your password now!");
        setTimeout(() => {
          window.open("https://mail.google.com/mail/u/0/#inbox", "_self");
          window.close();
        }, 1500);
      } catch (error) {
        props.openPopupbox("Can't send email... Please try again later!");
      }
    }
  }

  return <div className="login-form content">
    <h2 className="heading-secondary ma-bt-lg">Enter Email</h2>
    <form className="form">
      <div className="form__group">
        <label className="form__label" htmlFor="email">
          Email address
          </label>
        <input
          onChange={handleChange}
          name="email"
          value={input.email}
          className="form__input"
          id="email"
          placeholder="you@provider.com"
          required="required"
          type="email"
        />
      </div>
      <div className="form__group">
        <button
          className="btn btn--blue"
          type="submit"
          onClick={sendEmail}
        >Send Email
        </button>
        <PopupboxContainer />
      </div>
    </form>
  </div>
}