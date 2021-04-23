import React from 'react';
import * as successIcon from "../success.json";
import Lottie from "react-lottie";
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Success() {
  var data = JSON.parse(localStorage.getItem("userInfo"));
  const config = { headers: { "content-type": "application/json", Authorization: `Bearer ${data.token}` } }
  
  const addBooking = async (event) => {
    event.preventDefault();
    const newBooking = {
      tour: "60803f0c7095e50734666d71",
      user: "607fae6c2a038f4480160eee",
      price: "10000",
    };
    try {
      await axios.post("http://localhost:5000/api/v1/bookings", newBooking, config);
      window.location.reload();
    } catch (error) {
      console.log(error.message)
    }
  }

  return <>
    <Lottie options={{
      loop: true, autoplay: true, animationData: successIcon.default,
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
    }} height="30vh" width="50vh" />
    <h1 style={{ color: "#70C645", textAlign: "center" }}>Payment Successfull!</h1>
    <br /> <br />
    <Link to="/" className="btn btn--blue" style={{ display: "flex", justifyContent: "center", margin: "0 40%" }}>Go to HomePage</Link>
    <button className="btn btn--blue" style={{ display: "flex", justifyContent: "center", margin: "0 40%" }} onClick={addBooking}>Add Booking</button>
  </>
}