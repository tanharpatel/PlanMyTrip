import React from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

export default function ConfirmBooking() {
  var data = JSON.parse(localStorage.getItem("userInfo"));
  const config = { headers: { "content-type": "application/json", Authorization: `Bearer ${data.token}` } }
  let history = useHistory();
  
  const query = new URLSearchParams(window.location.search);
  const tour = query.get('tour')
  const name = query.get('name')
  const user = query.get('user')
  const price = query.get('price')

  const addBooking = async (event) => {
    event.preventDefault();
    const newBooking = {
      tour: tour,
      user: user,
      price: price,
    };
    try {
      await axios.post("http://localhost:5000/api/v1/bookings", newBooking, config);
      history.push("/success");
    } catch (error) {
      history.push("/failed");
    }
  }

  return <>
    <h1 style={{ textAlign: "center" }} className="reviews__text">Pay <strong>&#8377; {price}</strong> for {name}</h1>
    <button className="btn btn--blue" style={{ display: "flex", justifyContent: "center", margin: "0 40%" }} onClick={addBooking}>Confirm Booking</button>
  </>
}