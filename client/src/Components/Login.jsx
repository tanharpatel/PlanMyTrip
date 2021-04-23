import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

export default function Login(props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  let history = useHistory();
  const [input, setInput] = useState({ email: "", password: "" })

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInput((prevInput) => {
      return {
        ...prevInput,
        [name]: value,
      };
    });
  }

  const loginFunc = async (event) => {
    event.preventDefault();
    const data = {
      email: input.email,
      password: input.password,
    };

    if (input.email === "" || input.password === "") {
      alert("No field can be empty!!!")
    } else {
      try {
        const user = await axios.post("http://localhost:5000/api/v1/users/login", data);
        if (user.data) {
          const userInfo = {
            _id: user.data.data.user._id,
            name: user.data.data.user.name,
            email: user.data.data.user.email,
            photo: user.data.data.user.photo,
            token: user.data.token,
          };
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          history.push("/");
          window.location.reload();
        } else {
          props.openPopupbox("Credentials are incorrect... Please verify and login again!");
        }
      } catch (error) {
        props.openPopupbox("Something went wrong... Please try again later!");
      }
    }
  };

  return (
    <div className="login-form content">
      <h2 className="heading-secondary ma-bt-lg">Log into your account</h2>
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
        <div className="form__group ma-bt-md">
          <label className="form__label" htmlFor="password">
            Password
          </label>
          <input
            onChange={handleChange}
            name="password"
            value={input.password}
            className="form__input"
            id="password"
            minLength="8"
            placeholder="••••••••"
            required="required"
            type="password"
          />
        </div>
        <div className="form__group">
          <button
            className="btn btn--blue"
            type="submit"
            onClick={(event) => loginFunc(event)}>
            Login
          </button>
        </div>
      </form>
    </div>
  );
}