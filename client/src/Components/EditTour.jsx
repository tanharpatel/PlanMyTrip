import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { PopupboxContainer } from 'react-popupbox';
// var DatePicker = require("reactstrap-date-picker");
import DatePicker from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

export default function EditTour(props) {
  let history = useHistory();
  var data = JSON.parse(localStorage.getItem("userInfo"));
  const editTrip = JSON.parse(localStorage.getItem("editTrip"));
  const config = { headers: { "content-type": "application/json", Authorization: `Bearer ${data.token}` } }
  const [input, setInput] = useState({ price: "" })
  const [dateInput, setDate] = useState({ startDates: editTrip.startDates })
  var newStartDate = new Date();
  const disablePastDate = current => {
    return current.isAfter(moment().subtract(1, 'day'));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInput((prevInput) => {
      return {
        ...prevInput,
        [name]: value,
      };
    });
  }

  // const handleDateChange = (value, formattedValue) => {
  //   setDate({
  //     startDates: value, // ex: "2021-04-19T12:00:00.000Z"
  //     formattedValue: formattedValue // ex: "04/19/2021"
  //   });
  // }

 const changeDate = (event) => {
  var date = new Date();
  date.setTime(event.toDate());
  newStartDate = date.toISOString();
}

  const update = async (event) => {
    event.preventDefault();
    var newData = {};
    if ((input.price === "" && dateInput.startDates === "") || (input.price === dateInput.price && dateInput.startDates === newStartDate) ||
      (input.price === editTrip.price && dateInput.startDates === "") || (input.price === "" && dateInput.startDates === newStartDate)) {
      props.openPopupbox("Nothing to update");
    } else {
      if (input.price === "") {
        newData = { price: editTrip.price, startDates: newStartDate };
      } else if (input.email === "") {
        newData = { price: input.price, startDates: editTrip.startDates };
      } else {
        newData = { price: input.price, startDates: newStartDate };
      }
      try {
        console.log(newData);
        await axios.patch(`http://localhost:5000/api/v1/tours/${editTrip.id}`, newData, config);
        props.openPopupbox("Trip updated Successfully");
        localStorage.removeItem("editTrip");
        setTimeout(() => {
          history.push("/");
          window.location.reload();
        }, 1000);
      } catch (error) {
        props.openPopupbox("Trip update failed... Please try again later!");
      }
    }
  }

  return <div className="login-form content">
    <h2 className="heading-secondary ma-bt-lg">Edit {editTrip.name}</h2>
    <form className="form">
      <div className="form__group">
        <label className="form__label" htmlFor="email">Price</label>
        <input
          className="form__input"
          id="price"
          name="price"
          onChange={handleChange}
          value={input.price}
          placeholder={editTrip.price}
          required="required"
          type="number"
          min={editTrip.price}
          step={500}
          precision={0}
        />
      </div>
      <div className="form__group" >
        <label className="form__label" htmlFor="email">Start Date</label>
        <DatePicker dateFormat="MM/DD/YYYY" timeFormat={false}
          className="form__input"
          id="startDates"
          name="startDates"
          required="required"
          value={dateInput.startDates.substring(0, 10)}
          onChange={changeDate}
          // onChange={(v, f) => handleDateChange(v, f)}
          isValidDate={disablePastDate}
          closeOnSelect="true"          
        />
      </div>
      <div className="form__group">
        <button className="btn btn--blue" onClick={update}>Update</button>
      </div>
      <PopupboxContainer />
    </form>
  </div>
}