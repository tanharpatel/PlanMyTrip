import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ImLocation } from 'react-icons/im';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { bookTour } from "./Stripe";
import { PopupboxContainer } from 'react-popupbox';

function TripDetail(props) {
  let history = useHistory();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const tripId = localStorage.getItem("trip");
  var role = JSON.parse(localStorage.getItem("role"));
  var textToShow = "";
  if (localStorage.getItem("userInfo") !== null) {
    if (role === "admin") {
      textToShow = "Edit Tour now!";
    } else {
      textToShow = "Book Tour now!";
    }
  } else {
    textToShow = "Login to Book tour!"
  }

  const editOrBook = (tourId, name, price, startDates) => {
    if (localStorage.getItem("userInfo") !== null) {
      if (role === "admin") {
        const editTrip = {
          id: tourId,
          name: name,
          price: price,
          startDates: startDates,
        };
        localStorage.setItem("editTrip", JSON.stringify(editTrip));
        history.push("/editTour");
      } else {
        props.openPopupbox("Processing... Please wait a while!");
        bookTour(props.id);
      }
    } else {
      history.push('/login');
    }
  }

  const filteredTrip = props.filterByValue(props.trips, tripId);
  const filteredReviews = props.filterByValue(props.reviews, tripId);

  var reviewsList = [];
  if (filteredReviews.length === 0) {
    reviewsList.push({
      id: 0,
      name: "",
      rating: 0,
      review: "No review added yet for this tour..."
    });
  }

  for (var i = 0; i < filteredReviews.length; i++) {
    reviewsList.push({
      id: i,
      name: filteredReviews[i].user.name,
      rating: filteredReviews[i].rating,
      review: filteredReviews[i].review
    });
  }

  const [currentItemIndex, setCurrentIndex] = useState(0);
  const currentReview = reviewsList[currentItemIndex];
  const previousReview = () => {
    let currentIndex = currentItemIndex - 1;
    if (currentIndex < 0) { currentIndex = reviewsList.length - 1; }
    setCurrentIndex(currentIndex);
  };
  const nextReview = () => {
    let currentIndex = currentItemIndex + 1;
    if (currentIndex > reviewsList.length - 1) { currentIndex = 0; }
    setCurrentIndex(currentIndex);
  };

  return (
    <React.Fragment>
      {filteredTrip.map((trip) => {
        var currentRatings = [];
        var currentRatingsNum = parseInt(currentReview.rating);
        for (var i = 0; i < currentRatingsNum; i++) { currentRatings.push("1"); }
        return (
          <div className="content" key={trip.id}>
            <section className="section-header">
              <img className="bg" src={`tour-${trip.id}-cover.jpg`} alt="" />
              <div className="heading-box">
                <h1 className="heading-primary">
                  <span>{trip.name}</span>
                </h1>
                <div className="heading-box__group">
                  <div className="heading-box__detail">
                    <svg className="heading-box__icon">
                      <use href="./icons.svg#icon-clock"></use>
                    </svg>
                    <span className="heading-box__text" style={{ color: "black" }}>{trip.duration} days</span>
                  </div>
                  <div className="heading-box__detail">
                    <svg className="heading-box__icon">
                      <use href="./icons.svg#icon-map-pin"></use>
                    </svg>
                    <span className="heading-box__text" style={{ color: "black" }}>{trip.startLocation.description}</span>
                  </div>
                </div>
              </div>
            </section>
            <section className="section-description">
              <div className="overview-box">
                <div>
                  <div className="overview-box__group">
                    <h2 className="heading-secondary ma-bt-lg">Itinerary</h2>
                    {trip.locations.map((location) => (
                      <div className="overview-box__detail">
                        <ImLocation className="icons" />
                        <span className="overview-box__label">Day {location.day}</span>
                        <span className="overview-box__text">{location.description}</span>
                      </div>
                    ))}
                  </div>
                  <div className="overview-box__group">
                    <h2 className="heading-secondary ma-bt-lg">Your tour guides</h2>
                    {trip.guides.map((guide) => (
                      <div className="overview-box__detail">
                        <img alt="Lead Guide" className="overview-box__img" src="users/default.jpg" />
                        <span className="overview-box__label">{guide.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="description-box">
                <h2 className="heading-secondary ma-bt-lg">About the Tour</h2>
                <p className="description__text">{trip.description}</p>
              </div>
            </section>
            <section className="section-pictures">
              <div className="picture-box">
                <img alt="" className="picture-box__img picture-box__img--1" src={`tour-${trip.id}-1.jpg`} />
              </div>
              <div className="picture-box">
                <img alt="" className="picture-box__img picture-box__img--2" src={`tour-${trip.id}-2.jpg`} />
              </div>
              <div className="picture-box">
                <img alt="" className="picture-box__img picture-box__img--3" src={`tour-${trip.id}-3.jpg`} />
              </div>
            </section>
            <section className="section-map">
              <div id="map">
                <Map
                  google={props.google}
                  zoom={5}
                  style={{ width: '100%', height: '100%' }}
                  initialCenter={{ lat: trip.locations[0].coordinates[0], lng: trip.locations[0].coordinates[1] }} >
                  {trip.locations.map((location, index) => {
                    return <Marker key={index} id={index} position={{
                      lat: location.coordinates[0],
                      lng: location.coordinates[1],
                    }} />
                  })}
                </Map>
              </div>
            </section>
            <section className="section-reviews">
              <div className="review">
                <div className="img-container">
                  <img src="users/default.jpg" className="person-img" alt="" />
                </div>
                <h6 className="reviews__user">{currentReview.name}</h6>
                <p className="reviews__text">{currentReview.review}</p>
                <div className="reviews__rating">
                  {currentRatings.map(() => (
                    <svg className="reviews__star reviews__star--active">
                      <use href="./icons.svg#icon-star" />
                    </svg>
                  ))}
                </div>
                <div className="button-container">
                  <button className="prev-btn" onClick={previousReview} title="Previous"> &#x2039; </button>
                  <button className="next-btn" onClick={nextReview} title="Next"> &#x203A; </button>
                </div>
              </div>
            </section>
            <section className="section-cta">
              <div className="cta">
                <img alt="" className="cta__img cta__img--1" src="1.jpg" />
                <img alt="" className="cta__img cta__img--2" src="2.jpg" />
                <img alt="" className="cta__img cta__img--3" src="3.jpg" />
                <div className="cta__content">
                  <h2 className="heading-secondary">What are you waiting for?</h2>
                  <p className="cta__text">{trip.duration} days. 1 adventure. Infinite memories. Make it yours today!</p>
                  <button className="btn btn--blue span-all-rows" onClick={() => editOrBook(trip.id, trip.name, trip.price, trip.startDates[0])}>{textToShow}</button>
                  <PopupboxContainer />
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </React.Fragment>
  );
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDwoC-P5hPW08FtB6_4MaEyeqg8C_cRpoU'
})(TripDetail);