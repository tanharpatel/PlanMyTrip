import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from 'react-router-dom';

export default function SignUp(props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  let history = useHistory();
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: ""
  });

  function handleChange(event) {
    const {name, value} = event.target;
    setInput(prevInput => {
      return {
        ...prevInput,
        [name]: value
      }
    })
  }

  const signUpFunc = async (event) => {
    event.preventDefault();
    const data = {
      name: input.name,
      email: input.email,
      password: input.password,
      passwordConfirm: input.passwordConfirm
    };

    if(input.name === "" || input.email === "" || input.password === "" || input.passwordConfirm === "") {
      alert("No field can be empty!!!")
    } else if(input.password !== input.passwordConfirm) {
      alert("Password doesn't matches!!!")
    } else if(input.password.length < 8) {
      alert("Password must be of at least 8 characters!!!");
    } else {
      try {
        const user = await axios.post("http://localhost:5000/api/v1/users/signup", data);
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
          props.openPopupbox("Something went wrong... Please try again later!");
        }
      } catch (error) {
        props.openPopupbox("Something went wrong... Please try again later!");
      }
    }
  }

  return (
    <div className="login-form content">
      <h2 className="heading-secondary ma-bt-lg">Create your account</h2>
      <form className="form">
        <div className="form__group">
          <label className="form__label" htmlFor="email">
            Your name
          </label>
          <input
            className="form__input"
            id="name"
            placeholder="Plan My Trip"
            required="required"
            type="text"
            name="name"
            onChange={handleChange}
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="email">
            Email address
          </label>
          <input
            className="form__input"
            id="email"
            placeholder="you@provider.com"
            required="required"
            type="email"
            name="email"
            onChange={handleChange}
          />
        </div>
        <div className="form__group ma-bt-md">
          <label className="form__label" htmlFor="password">
            Password
          </label>
          <input
            className="form__input"
            id="password"
            minLength="8"
            placeholder="••••••••"
            required="required"
            type="password"
            name="password"
            onChange={handleChange}
          />
        </div>
        <div className="form__group ma-bt-md">
          <label className="form__label" htmlFor="password">
            Confirm Password
          </label>
          <input
            className="form__input"
            id="confirmpassword"
            minLength="8"
            placeholder="••••••••"
            required="required"
            type="password"
            name="passwordConfirm"
            onChange={handleChange}
          />
        </div>
        <div className="form__group">
          <button
            className="btn btn--blue"
            type="submit"
            onClick={(event) => signUpFunc(event)}>
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};