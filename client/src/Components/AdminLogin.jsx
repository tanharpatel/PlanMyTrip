import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { PopupboxContainer } from 'react-popupbox';

export default function AdminLogin(props) {
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
      props.openPopupbox("No field can be empty!!!")
    } else {
      const filteredUser = props.filterByValue(props.users, input.email);
      if(filteredUser[0].role === "admin") {
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
            localStorage.setItem("role", JSON.stringify("admin"));
            history.push("/");
            window.location.reload();
          } else {
            props.openPopupbox("Can't make you login now... Please try again later!");
          }
        } catch (error) {
          props.openPopupbox("Credentials are incorrect... Please verify and login again!");
        }
      } else {
        props.openPopupbox("You are not admin. Login as user!");
      }
    }
  };

  return (
    <div className="login-form content">
      <h2 className="heading-secondary ma-bt-lg">Login as admin</h2>
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
          <Link to="/forgotPassword"
            className="btn-text"
            style={{ float: "right", color: "#0000ff" }}
            type="submit"
          ><strong>Forgot Password?</strong></Link>
        </div>
        <div className="form__group">
          <button
            className="btn btn--blue"
            type="submit"
            onClick={(event) => loginFunc(event)}>
            Login
          </button>
          <PopupboxContainer />
          <Link to="/login"
            className="btn-text"
            style={{ color: "#0000ff", marginLeft: "2rem" }}
            type="submit"
          ><strong>Are you USER?</strong></Link>
        </div>
      </form>
    </div>
  );
}