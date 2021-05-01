import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory, Link } from 'react-router-dom';
import { PopupboxContainer } from 'react-popupbox';

export default function UserProfile(props) {
  let history = useHistory();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  var data = JSON.parse(localStorage.getItem("userInfo"));
  var role = JSON.parse(localStorage.getItem("role"));
  const filteredReview = props.filterByValue(props.reviews, data._id);
  const filteredBooking = props.filterByValue(props.bookings, data._id);

  var [isActive, setActive] = useState("");
  var [isSelected] = useState({ isProfile: true, isBooking: false, isReviews: false, isBilling: false, isMTours: false, isMUsers: false, isMReviews: false, isMBookings: false });
  var [input, setInput] = useState({ passwordCurrent: "", password: "", passwordConfirm: "", review: "", name: "" });
  var [image, setImage] = useState({ preview: "", raw: "", hasImage: false, src: "default.jpg" });

  const config = { headers: { "content-type": "application/json", Authorization: `Bearer ${data.token}` } }

  const onClick = variable => () => {
    Object.keys(isSelected).forEach(v => isSelected[v] = false);
    isActive = setActive(variable);
    isSelected[variable] = true;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setInput((prevInput) => {
      return {
        ...prevInput,
        [name]: value,
      };
    });
  }

  const uploadImage = e => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
    }
  };

  const updateImage = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("photo", image.raw);
    console.log(image.raw);
    try {
      await axios.patch("http://localhost:5000/api/v1/users/updateMe", formData, config);
      const userInfo = {
        _id: data._id,
        name: data.name,
        email: data.email,
        photo: `user-${data._id}.jpeg`,
        token: data.token,
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      props.openPopupbox("Profile image updated successfully");
    } catch (error) {
      props.openPopupbox("Error updating your profile image...Please try again later!");
    }
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    var newData = {};
    if ((input.name === "" && input.email === "") || (input.name === data.name && input.email === data.email) ||
      (input.name === data.name && input.email === "") || (input.name === "" && input.email === data.email)) {
      props.openPopupbox("Nothing to update");
    } else {
      if (input.name === "") {
        newData = { name: data.name, email: input.email };
      } else {
        newData = { name: input.name, email: data.email };
      }
      try {
        const newProfileData = await axios.patch("http://localhost:5000/api/v1/users/updateMe", newData, config);
        if (newProfileData.data) {
          const userInfo = {
            _id: newProfileData.data.data.user._id,
            name: newProfileData.data.data.user.name,
            email: newProfileData.data.data.user.email,
            photo: newProfileData.data.data.user.photo,
            token: data.token,
          };
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          props.openPopupbox("Updated successfully");
        } else {
          props.openPopupbox("Failed to update...Please try again later!");
        }
      } catch (error) {
        props.openPopupbox("Error updating your profile...Please try again later!");
      }
    }
  }

  const updatePwd = async (event) => {
    event.preventDefault();
    const newPass = {
      passwordCurrent: input.passwordCurrent,
      password: input.password,
      passwordConfirm: input.passwordConfirm,
    };

    if (input.passwordCurrent === "") {
      props.openPopupbox("Current Password can't be empty!!!");
    } else if (input.password !== input.passwordConfirm) {
      props.openPopupbox("Password doesn't matches!!!");
    } else if (input.passwordCurrent.length < 8 || input.password.length < 8) {
      props.openPopupbox("Password must be of at least 8 characters!!!");
    } else {
      try {
        console.log(newPass);
        await axios.patch("http://localhost:5000/api/v1/users/updateMyPassword", newPass, config);
        props.openPopupbox("Password updated Successfully. Login with new password.");
        localStorage.removeItem("userInfo");
        window.location.reload();
        history.push("/login");
      } catch (error) {
        console.log(error.message);
        props.openPopupbox("Error updating your password... Please try again later!");
      }
    }
  }

  const deleteProfile = async (event) => {
    event.preventDefault();
    try {
      await axios.delete("http://localhost:5000/api/v1/users/deleteMe", config);
      localStorage.removeItem("userInfo");
      props.openPopupbox("Profile Deleted Successfully");
      history.push("/");
    } catch (error) {
      props.openPopupbox("Error deleting your profile... Please try again later!");
    }
  }

  const deleteUser = userId => async (event) => {
    event.preventDefault();
    try {
      await axios.delete(`http://localhost:5000/api/v1/users/${userId}`, config);
      props.openPopupbox("User Deleted Successfully");
      window.location.reload();
    } catch (error) {
      props.openPopupbox("Error deleting user... Please try again later!");
    }
  }

  const editTour = (tourId, name, price, startDates) => {
    const editTrip = {
      id: tourId,
      name: name,
      price: price,
      startDates: startDates,
    };
    localStorage.setItem("editTrip", JSON.stringify(editTrip));
    history.push("/editTour");
  }

  const deleteTour = tourId => async (event) => {
    event.preventDefault();
    try {
      props.openPopupbox("Are you sure you want to delete?");
      await axios.delete(`http://localhost:5000/api/v1/tours/${tourId}`, config);
      props.openPopupbox("Tour Deleted Successfully");
      window.location.reload();
    } catch (error) {
      props.openPopupbox("Error deleting tour... Please try again later!");
    }
  }

  const deleteReview = reviewId => async (event) => {
    event.preventDefault();
    try {
      await axios.delete(`http://localhost:5000/api/v1/reviews/${reviewId}`, config);
      props.openPopupbox("Review Deleted Successfully");
      window.location.reload();
    } catch (error) {
      props.openPopupbox("Error deleting review... Please try again later!");
    }
  }

  var getReviews = (rating) => {
    var currentRatings = [];
    var currentRatingsNum = parseInt(rating);
    for (var i = 0; i < currentRatingsNum; i++) {
      currentRatings.push("1");
    }
    return currentRatings.map(() => (
      <svg className="reviews__star reviews__star--active">
        <use href="./icons.svg#icon-star" />
      </svg>
    ))
  }

  return <div className="user-view content">
    <nav className="user-view__menu">
      <ul className="side-nav">
        <li className={isSelected["isProfile"] ? "side-nav--active" : ""}>
          <Link to="#" onClick={onClick("isProfile")}>
            <svg> <use href="./icons.svg#icon-settings" /> </svg>
            Settings
          </Link>
        </li>
        {role === "user"
          ? <>
            <li className={isSelected["isBooking"] ? "side-nav--active" : ""}>
              <Link to="#" onClick={onClick("isBooking")}>
                <svg> <use href="./icons.svg#icon-briefcase" /> </svg>
            My bookings
          </Link>
            </li>
            <li className={isSelected.isReviews ? "side-nav--active" : ""}>
              <Link to="#" onClick={onClick("isReviews")}>
                <svg> <use href="./icons.svg#icon-star" /> </svg>
            My reviews
          </Link>
            </li>
          </>
          : <></>
        }
      </ul>
      {role === "admin"
        ? <div className="admin-nav">
          <h5 className="admin-nav__heading">Admin</h5>
          <ul className="side-nav">
            <li className={isSelected.isMTours ? "side-nav--active" : ""}>
              <Link to="#" onClick={onClick("isMTours")}>
                <svg> <use href="./icons.svg#icon-map" /> </svg>
              Manage tours
            </Link>
            </li>
            <li className={isSelected.isMUsers ? "side-nav--active" : ""}>
              <Link to="#" onClick={onClick("isMUsers")}>
                <svg> <use href="./icons.svg#icon-users" /> </svg>
              Manage users
            </Link>
            </li>
            <li className={isSelected.isMReviews ? "side-nav--active" : ""}>
              <Link to="#" onClick={onClick("isMReviews")}>
                <svg> <use href="./icons.svg#icon-star" /> </svg>
              Manage reviews
            </Link>
            </li>
            <li className={isSelected.isMBookings ? "side-nav--active" : ""}>
              <Link to="#" onClick={onClick("isMBookings")}>
                <svg> <use href="./icons.svg#icon-briefcase" /> </svg>
              Manage Bookings
            </Link>
            </li>
          </ul>
        </div>
        : <></>}
    </nav>
    <div className="user-view__content">
      {(() => {
        switch (isActive) {
          case "isBooking":
            return (
              <div className="user-view__form-container">
                <h2 className="heading-secondary ma-bt-md">Your bookings</h2>
                <div>
                  {filteredBooking.map((booking) => (
                    <div>
                      <div className="bookings__card">
                        <h5 className="reviews__user">{booking.tour.name}</h5>
                        <h6 className="reviews__text">
                          <span className="card__footer-text">For &nbsp;</span>
                          <span className="card__footer-value">&#8377;{booking.price} </span>
                        </h6>
                        <h1 className="card__footer-value" style={{ color: booking.paid ? "#70C645" : "#D22E2E" }}>{booking.paid ? "PAID" : "UNPAID"}</h1>
                      </div>
                      <br />
                    </div>
                  ))}
                </div>
                <br /> <br /> <br />
                <Link
                  to="/newReview"
                  className="btn btn--blue"
                  style={{ float: "right" }}
                  type="submit"
                >Add review</Link>
                <PopupboxContainer {...{ titleBar: { enable: true, text: "Review Alert" } }} />
              </div>
            )
          case "isReviews":
            return (
              <div className=" user-view__form-container">
                <h2 className="heading-secondary ma-bt-md">Your Reviews</h2>
                <div className="reviews-container">
                  {filteredReview.map((review) => (
                    <div className="reviews__card">
                      <h6 className="reviews__user">{review.tourName}</h6>
                      <br />
                      <p className="reviews__text">
                        {review.review}
                      </p>
                      <div className="reviews__rating">
                        {getReviews(review.rating)}
                      </div>
                      <br />
                      <button
                        className="btn btn--small"
                        type="submit"
                        onClick={deleteReview(review.id)}
                      >Delete</button>
                      <PopupboxContainer {...{ titleBar: { enable: true, text: "Review Alert" } }} />
                    </div>
                  ))}
                </div>
              </div>
            )
          case "isMTours":
            return (
              <div className="user-view__form-container">
                <h2 className="heading-secondary ma-bt-md">Manage Tours</h2>
                <div className="reviews-container">
                  {props.trips.map((trip) => (
                    <div className="reviews__card">
                      <h6 className="reviews__user">{trip.name}</h6>
                      <p className="card__ratings">
                        <span className="card__footer-value">{trip.ratingsAverage} </span>
                        <span className="card__footer-text">rating ({trip.ratingsQuantity})</span>
                      </p>
                      <br />
                      <p className="reviews__text">{trip.summary}</p>
                      <div>
                        <button
                          className="btn"
                          type="submit"
                          onClick={() => editTour(trip.id, trip.name, trip.price, trip.startDates[0])}
                        >Edit</button>
                        <button
                          className="btn btn--small"
                          type="submit"
                          onClick={deleteTour(trip.id)}
                        >Delete</button>
                        <PopupboxContainer {...{ titleBar: { enable: true, text: "Tour Alert" } }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          case "isMUsers":
            return (
              <div className="user-view__form-container">
                <h2 className="heading-secondary ma-bt-md">Manage Users</h2>
                <div>
                  {props.users.map((user) => (
                    <div className="card">
                      <div className="card__footer">
                        <p>
                          <span className="card__footer-value">{user.name} </span>
                          <span className="card__footer-text"></span>
                        </p>
                        <p className="card__ratings">
                          <span className="card__footer-text">{user.email} </span>
                        </p>
                        <button
                          className="btn btn--small"
                          type="submit"
                          onClick={deleteUser(user._id)}
                        >Delete</button>
                        <PopupboxContainer {...{ titleBar: { enable: true, text: "User Alert" } }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          case "isMReviews":
            return (
              <div className="user-view__form-container">
                <h2 className="heading-secondary ma-bt-md">Manage Reviews</h2>
                <div className="reviews-container">
                  {props.reviews.map((review) => (
                    <div className="reviews__card">
                      <h6 className="reviews__user">By {review.user.name}</h6>
                      <br />
                      <p className="reviews__text">For {review.tourName}</p>
                      <p className="reviews__text">{review.review}</p>
                      <div className="reviews__rating">
                        {getReviews(review.rating)}
                      </div>
                      <br />
                      <button
                        className="btn btn--small"
                        type="submit"
                        onClick={deleteReview(review.id)}
                      >Delete</button>
                      <PopupboxContainer {...{ titleBar: { enable: true, text: "Review Alert" } }} />
                    </div>
                  ))}
                </div>
              </div>
            )
          case "isMBookings":
            return (
              <div className="user-view__form-container">
                <h2 className="heading-secondary ma-bt-md">Manage Bookings</h2>
                <div>
                  {props.bookings.map((booking) => (
                    <div>
                      <div className="bookings__card">
                        <h5 className="reviews__user">{booking.tour.name}</h5>
                        <h6 className="reviews__text">
                          <span className="card__footer-text">Booked By &nbsp;</span>
                          <span className="card__footer-value">{booking.user.name} </span>
                        </h6>
                        <h6 className="reviews__text">
                          <span className="card__footer-text">For &nbsp;</span>
                          <span className="card__footer-value">&#8377;{booking.price} </span>
                        </h6>
                        <h1 className="card__footer-value" style={{ color: booking.paid ? "#70C645" : "#D22E2E" }}>{booking.paid ? "PAID" : "UNPAID"}</h1>
                      </div>
                      <br />
                    </div>
                  ))}
                </div>
              </div>
            )
          default:
            return (
              <div>
                <div className="user-view__form-container">
                  <h2 className="heading-secondary ma-bt-md">Your account settings</h2>
                  <form className="form form-user-data">
                    <div className="form__group">
                      <label className="form__label" htmlFor="name">Name</label>
                      <input
                        className="form__input"
                        id="name"
                        onChange={handleChange}
                        name="name"
                        value={input.name}
                        placeholder={data.name}
                        type="text"
                      />
                    </div>
                    <div className="form__group ma-bt-md">
                      <label className="form__label" htmlFor="email">Email address</label>
                      <input
                        disabled={true}
                        className="form__input"
                        id="email"
                        onChange={handleChange}
                        name="email"
                        value={data.email}
                        type="text"
                      />
                    </div>
                    <div className="form__group form__photo-upload right">
                      <label htmlFor="photo">
                        {image.preview
                          ? <img src={image.preview} className="form__user-photo" alt="" />
                          : <img src={`users/${data.photo}`} alt="User" className="form__user-photo" style={{ cursor: "pointer" }} />
                        }
                        <h5 className="text-center" style={{ cursor: "pointer" }} >Upload new photo</h5>
                      </label>
                      <input type="file" id="photo" name="photo" style={{ display: "none" }} onChange={uploadImage} />
                      <button
                        className="btn-text"
                        type="submit"
                        onClick={updateImage}
                        style={{ color: "#0000ff", marginLeft: "2rem", border: "none", outline: "none", cursor: "pointer" }}
                      ><strong>Update Image</strong></button>
                    </div>
                    <br /> <br />
                    <div className="form__group right">
                      <button
                        className="btn btn--blue"
                        type="submit"
                        onClick={(event) => updateProfile(event)}
                      >Udpate Profile</button>
                      <button
                        className="btn btn--blue"
                        type="submit"
                        onClick={(event) => deleteProfile(event)}
                      >Delete Profile</button>
                      <PopupboxContainer {...{ titleBar: { enable: true, text: "User Alert" } }} />
                    </div>
                  </form>
                </div>
                <div className="line">&nbsp;</div>
                <div className="user-view__form-container">
                  <h2 className="heading-secondary ma-bt-md">Password change</h2>
                  <form className="form form-user-settings">
                    <div className="form__group">
                      <label className="form__label" htmlFor="passwordCurrent">Current password</label>
                      <input
                        onChange={handleChange}
                        className="form__input"
                        id="passwordCurrent"
                        name="passwordCurrent"
                        minLength="8"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                    <div className="form__group">
                      <label className="form__label" htmlFor="password">New password</label>
                      <input
                        onChange={handleChange}
                        className="form__input"
                        id="password"
                        name="password"
                        minLength="8"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                    <div className="form__group ma-bt-lg">
                      <label className="form__label" htmlFor="passwordConfirm">Confirm password</label>
                      <input
                        onChange={handleChange}
                        className="form__input"
                        id="passwordConfirm"
                        name="passwordConfirm"
                        minLength="8"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                    <div className="form__group right">
                      <button
                        className="btn btn--blue"
                        type="submit"
                        onClick={(event) => updatePwd(event)}
                      >Save password</button>
                      <PopupboxContainer {...{ titleBar: { enable: true, text: "User Alert" } }} />
                    </div>
                  </form>
                </div>
              </div>
            )
        }
      })()}
    </div>
  </div>
}