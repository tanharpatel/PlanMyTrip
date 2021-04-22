import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { ImLocation } from 'react-icons/im';
import { TiFlag } from 'react-icons/ti';
import { HiUserGroup } from 'react-icons/hi';

export default function Tours(props) {
  useEffect(() => { window.scrollTo(0, 0); });
  return (
    <React.Fragment>
      <div className="card-container content">
        {props.trips.map((trip) => (
          <div className="card" key={trip.id}>
            <div className="card__header">
              <div className="card__picture">
                {/* <div className="card__picture-overlay">&nbsp;</div> */}
                <img src={`tour-${trip.id}-cover.jpg`} alt="" className="card__picture-img" />
              </div>
              <h3 className="heading-tertirary">
                <span>{trip.name}</span>
              </h3>
            </div>
            <div className="card__details">
              <h4 className="card__sub-heading">{trip.duration}-day tour</h4>
              <p className="card__text">{trip.summary}</p>
              <div className="card__data">
                <ImLocation className="icons" />
                <span>{trip.startLocation.description}</span>
              </div>
              <div className="card__data">
                <FaRegCalendarAlt className="icons" />
                <span>{trip.startDates[0].substring(0,10)}</span>
              </div>
              <div className="card__data">
                <TiFlag className="icons" />
                <span>{trip.Days} stops</span>
              </div>
              <div className="card__data">
                <HiUserGroup className="icons" />
                <span>{trip.maxGroupSize} people</span>
              </div>
            </div>
            <div className="card__footer">
              <p>
                <span className="card__footer-value">{trip.price} </span>
                <span className="card__footer-text">per person</span>
              </p>
              <p className="card__ratings">
                <span className="card__footer-value">{trip.ratingsAverage} </span>
                <span className="card__footer-text">rating ({trip.ratingsQuantity})</span>
              </p>
              <Link to="/tripdetail" 
                className="btn btn--blue"
                type="submit"
                onClick={() => props.sendID(trip.id)}
              >Details</Link>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}