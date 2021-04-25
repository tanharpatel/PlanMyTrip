import React, { useState } from "react";
import axios from 'axios';

export default function EnterEmail() {
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

  const sendEmail = async () => {
    try {
      const data = {
        email: input.email,
      };
      await axios.post("http://localhost:5000/api/v1/users/forgotPassword", data);
      console.log("mail sent");
    } catch (error) {
      console.log(error.message);
      // props.openPopupbox("Something went wrong... Please try again later!");
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
      </div>
    </form>
  </div>
}