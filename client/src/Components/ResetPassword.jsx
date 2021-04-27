import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory, useLocation } from 'react-router-dom';

export default function ResetPassword(props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  let history = useHistory();
  const token = (useLocation().pathname.substring(useLocation().pathname.lastIndexOf('/') + 1));
  const [input, setInput] = useState({
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
      password: input.password,
      passwordConfirm: input.passwordConfirm
    };

    if(input.password === "" || input.passwordConfirm === "") {
      alert("No field can be empty!!!")
    } else if(input.password !== input.passwordConfirm) {
      alert("Password doesn't matches!!!")
    } else if(input.password.length < 8) {
      alert("Password must be of at least 8 characters!!!");
    } else {
      try {
        console.log(data);
        await axios.patch(`http://localhost:5000/api/v1/users/resetPassword/${token}`, data);
        props.openPopupbox("Your password is successfully updated!");
        history.push("/login");
      } catch (error) {
        props.openPopupbox("Something went wrong... Please try again later!");
      }
    }
  }

  return (
    <div className="login-form content">
      <h2 className="heading-secondary ma-bt-lg">Forgot Password</h2>
      <form className="form">
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
            Reset Password
          </button>
        </div>
      </form>
    </div>
  );
};