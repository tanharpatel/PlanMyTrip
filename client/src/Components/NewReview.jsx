import React, { useState, useEffect } from "react";
import axios from "axios";
import { PopupboxContainer } from "react-popupbox";

export default function NewReview(props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  var data = JSON.parse(localStorage.getItem("userInfo"));
  const config = { headers: { "content-type": "application/json", Authorization: `Bearer ${data.token}` } }
  const [select, setSelected] = useState({
    selectedTour: "",
    selectedtourId: "",
    selectedRating: "",
    selectedStar: "",
  });

  const filteredBooking = props.filterByValue(props.bookings, data._id);
  var newTrips = [filteredBooking];
  var tripsToShow = [];
  for (var i = 0; i < newTrips[0].length; i++) {
    tripsToShow.push({
      name: newTrips[0][i].tour.name,
      id: newTrips[0][i].tour.id
    });
  }

  const getUnique = (arr, comp) => {
    const unique = arr
      .map(e => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter(e => arr[e])
      .map(e => arr[e]);

    return unique;
  }

  const uniqueTrips = getUnique(tripsToShow, "id");
  const [input, setInput] = useState({ review: "" });
  var ratings = ["Horrible", "Bad", "Neutral", "Good", "Excellent"];

  const selectTour = (tourId, name) => async (event) => {
    event.preventDefault();
    setSelected((prevInput) => {
      return {
        ...prevInput,
        selectedTour: name,
        selectedtourId: tourId
      };
    });
  }

  const selectRatings = (rating, star) => async (event) => {
    event.preventDefault();
    setSelected((prevInput) => {
      return {
        ...prevInput,
        selectedRating: rating,
        selectedStar: star
      };
    });
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

  const addReview = async (event) => {
    event.preventDefault();
    const newReview = {
      rating: select.selectedStar,
      review: input.review,
      tour: select.selectedtourId,
      tourName: select.selectedTour,
    };
    try {
      console.log(newReview);
      await axios.post("http://localhost:5000/api/v1/reviews", newReview, config);
      props.openPopupbox("Review Added Successfully");
      window.location.reload();
    } catch (error) {
      props.openPopupbox("Error adding review... Please try again later!");
    }
  }

  return <div className="content login-form ">
    <h2 className="heading-secondary ma-bt-md">Add New Review</h2>
    <form className="form">
      <div className="ddcontainer">
        <button className="btn btn--blue ddbtn" onClick={() => props.toogleDropDownT()} ref={props.dropdown} >
          Select Tour ▼ </button>
        {props.isTOpen ? (
          <div className="dd">
            <ul className="ddul" ref={props.dropdown}>
              {uniqueTrips.map((trip) => (
                <li className="ddli" onClick={selectTour(trip.id, trip.name)}>{trip.name}</li>
              ))}
            </ul>
          </div>
        ) : <></>}
      </div>
      <div className="form__group">
        <label className="form__label" htmlFor="name">Your Selected Tour is</label>
        <input
          className="form__input"
          id="selectedTour"
          name="selectedRating"
          value={select.selectedTour}
          type="text"
        />
      </div>
      <div className="ddcontainer">
        <button className="btn btn--blue" onClick={() => props.toogleDropDownR()} ref={props.dropdown} >
          Rate the Tour ▼ </button>
        {props.isROpen ? (
          <div className="dd">
            <ul className="ddul" ref={props.dropdown}>
              {ratings.map((rating, index) => (
                <li className="ddli" onClick={selectRatings(rating, index + 1)}>{rating}</li>
              ))}
            </ul>
          </div>
        ) : <></>}
      </div>
      <div className="form__group">
        <label className="form__label" htmlFor="name">Your Selected Rating is</label>
        <input
          className="form__input"
          id="selectedRating"
          name="selectedRating"
          value={select.selectedRating + " " + select.selectedStar}
          type="text"
        />
      </div>
      <div className="form__group ma-bt-md">
        <label className="form__label" htmlFor="password">Review</label>
        <textarea
          rows="5"
          id="review"
          onChange={handleChange}
          name="review"
          value={input.review}
          className="form__input"
          placeholder="Your message here..."
          required="required"
        />
      </div>
      <div className="form__group">
        <button className="btn btn--blue"
          type="submit"
          onClick={(event) => addReview(event)}
        >Add Review</button>
        <PopupboxContainer {...{ titleBar: { enable: true, text: "Review Alert" } }} />
      </div>
    </form>
  </div>
}