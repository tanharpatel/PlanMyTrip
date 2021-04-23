import React, {useState} from 'react';
import { Link, useHistory } from 'react-router-dom';

export default function Header(props) {
  let history = useHistory();
  var data = JSON.parse(localStorage.getItem("userInfo"));
  const logoutFunc = async () => {
    localStorage.removeItem("userInfo");
    history.push("/");
    window.location.reload();
  };
  
  // const myProfile = props.filterByValue(props.users, data._id);
  
  // var [role, setRole] = useState("");
  // const onLinkClick = async () => {
  //   setRole({
  //     role: myProfile[0].role
  //   })
  // }

  return <div className="sticky">
    <header className="header">
      <nav className="nav nav--tours">
        <Link to="/" className="nav__el">All Tours</Link>
      </nav>
      <img src="PlanMyTrip.png" alt="Plan My Trip" height="80" />
      <nav className="nav nav--user">
        {props.isLoggedin ? (
          // <Link to="/userprofile" className="nav__el" onClick={onLinkClick}>
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
          <Link to="/signup" className="nav__el nav__el--cta">Sign Up</Link>
        )}
      </nav>
    </header>
  </div>;
}