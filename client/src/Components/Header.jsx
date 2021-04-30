import React from 'react';
import { Link, useHistory } from 'react-router-dom';

export default function Header(props) {
  let history = useHistory();
  var data = JSON.parse(localStorage.getItem("userInfo"));
  const logoutFunc = async () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("role");
    localStorage.removeItem("trip");
    history.push("/");
    window.location.reload();
  };

  return <div className="sticky">
    <header className="header">
      <nav className="nav nav--tours">
        <Link to="/" className="nav__el">All Tours</Link>
      </nav>
      <img src="PlanMyTrip.png" alt="Plan My Trip" height="80" />
      <nav className="nav nav--user">
        {props.isLoggedin ? (
          <Link to="/userprofile" className="nav__el">
            <img src={`users/${data.photo}`} alt="User" className="form__user-photo" style={{ cursor: "pointer", padding: "1rem", margin: "0", marginRight: "0.5rem" }} />
            User Profile
          </Link>
        ) : (
          <Link to="/login" className="nav__el nav__el--cta">Log in</Link>
        )}
        {props.isLoggedin ? (
          <Link to="/" className="nav__el nav__el--cta" onClick={(event) => logoutFunc(event)}>Logout</Link>
        ) : (
          <Link to="/verifyEmail" className="nav__el nav__el--cta">Sign Up</Link>
        )}
      </nav>
    </header>
  </div>;
}