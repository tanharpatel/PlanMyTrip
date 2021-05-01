import React, { Component, Fragment } from 'react';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import Lottie from "react-lottie";
import axios from "axios";
import './App.css';
import Header from './Components/Header';
import Login from './Components/Login';
import AdminLogin from './Components/AdminLogin';
import SignUp from './Components/SignUp';
import Tours from './Components/Tours';
import EditTour from './Components/EditTour';
import TripDetail from './Components/TripDetail';
import Footer from './Components/Footer';
import UserProfile from './Components/UserProfile';
import NewReview from './Components/NewReview';
import Contact from './Components/Contact';
import About from './Components/About';
import ConfirmBooking from './Components/ConfirmBooking';
import Error from './Components/Error';
import { PopupboxManager } from 'react-popupbox';
import "react-popupbox/dist/react-popupbox.css"
import * as loadingIcon from "./loading.json";
import * as successIcon from "./success.json";
import * as failedIcon from "./failed.json";
import ResetPassword from './Components/ResetPassword';
import ForgotPassword from './Components/ForgotPassword';
import VerifyEmail from './Components/VerifyEmail';

class App extends Component {

  state = {
    loaded: false,
    isLoggedin: false,
    hasData: undefined,
    id: [],
    trips: [],
    reviews: [],
    users: [],
    bookings: [],
    isTOpen: false,
    isROpen: false,
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ loaded: true });
    }, 4000);

    //fetches tours
    axios.get('http://localhost:5000/api/v1/tours/')
      .then((response) => {
        this.setState({ trips: response.data.data.tours });
        this.setState({ hasData: true });
      }).catch(() => {
        this.setState({ hasData: false });
      });

    //fetches reviews
    axios.get('http://localhost:5000/api/v1/reviews')
      .then((response) => {
        this.setState({ reviews: response.data.data.reviews });
        this.setState({ hasData: true });
      }).catch(() => {
        this.setState({ hasData: false });
      });

    //fetches users
    axios.get('http://localhost:5000/api/v1/users')
      .then((response) => {
        this.setState({ users: response.data.data.users });
        this.setState({ hasData: true });
      }).catch(() => {
        this.setState({ hasData: false });
      });

    //fetches booking details
    axios.get('http://localhost:5000/api/v1/bookings')
      .then((response) => {
        this.setState({ bookings: response.data.data.bookings });
        this.setState({ hasData: true });
      }).catch(() => {
        this.setState({ hasData: false });
      });

    //checks if user is loggedin or not
    if (!localStorage.getItem('userInfo')) {
      this.setState({ isLoggedin: false });
    } else {
      this.setState({ isLoggedin: true });
    }

    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  dropdown = React.createRef();
  sendID = (tripId) => { this.setState({ id: tripId }); localStorage.setItem("trip", JSON.stringify(tripId)); }
  toogleDropDownT = () => { this.setState({ isTOpen: !this.state.isTOpen }); this.setState({ isROpen: false }); }
  toogleDropDownR = () => { this.setState({ isROpen: !this.state.isROpen }); this.setState({ isTOpen: false }); }
  openPopupbox = (content) => { PopupboxManager.open({ content }); }
  handleClickOutside = (event) => { if (this.dropdown.current && !this.dropdown.current.contains(event.target)) { this.setState({ isTOpen: false }); this.setState({ isROpen: false }); } };
  filterByValue(array, value) { return array.filter((data) => JSON.stringify(data).toLowerCase().indexOf(value) !== -1); }

  render() {
    return (
      <Fragment>
        <Header isLoggedin={this.state.isLoggedin}></Header>
        <div className="main">
          {/* <img className="bg" src="4.jpg" alt="" /> */}
          <Switch>
            <Route path="/" exact
              render={() => (
                this.state.loaded ? (
                  this.state.hasData ? (
                    <Tours trips={this.state.trips} sendID={this.sendID} />
                  ) : (
                    <Redirect to="/error" />
                  )) : (
                  <Lottie options={{
                    loop: true, autoplay: true, animationData: loadingIcon.default,
                    rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
                  }} height="48vh" width="100vh" />
                )
              )}>
            </Route>

            <Route path="/login" exact>
              <Login openPopupbox={this.openPopupbox} users={this.state.users} filterByValue={this.filterByValue} />
            </Route>

            <Route path="/adminlogin" exact>
              <AdminLogin openPopupbox={this.openPopupbox} users={this.state.users} filterByValue={this.filterByValue} />
            </Route>

            <Route path="/signup" exact>
              <SignUp openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/tripdetail" exact>
              <TripDetail trips={this.state.trips} reviews={this.state.reviews} id={this.state.id} filterByValue={this.filterByValue} openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/userprofile" exact>
              <UserProfile trips={this.state.trips} users={this.state.users} reviews={this.state.reviews} bookings={this.state.bookings} filterByValue={this.filterByValue} openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/newReview" exact>
              <NewReview bookings={this.state.bookings} filterByValue={this.filterByValue} toogleDropDownT={this.toogleDropDownT} toogleDropDownR={this.toogleDropDownR} isTOpen={this.state.isTOpen} isROpen={this.state.isROpen} dropdown={this.dropdown} openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/editTour" exact>
              <EditTour openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/confirm" >
              <ConfirmBooking />
            </Route>

            <Route path="/about" exact>
              <About />
            </Route>

            <Route path="/contact" exact>
              <Contact />
            </Route>

            <Route path="/error" exact>
              <Error />
            </Route>

            <Route path="/forgotPassword" >
              <ForgotPassword openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/verifyEmail" exact>
              <VerifyEmail openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/resetPassword/:token" >
              <ResetPassword openPopupbox={this.openPopupbox} />
            </Route>

            <Route path="/success" exact>
              <>
                <Lottie options={{
                  loop: true, autoplay: true, animationData: successIcon.default,
                  rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
                }} height="30vh" width="50vh" />
                <h1 style={{ color: "#70C645", textAlign: "center" }}>Payment Successfull!</h1>
                <br /> <br />
                <Link to="/" className="btn btn--blue" style={{ display: "flex", justifyContent: "center", margin: "0 40%" }}>Go to HomePage</Link>
              </>
            </Route>

            <Route path="/failed" exact>
              <>
                <Lottie options={{
                  loop: true, autoplay: true, animationData: failedIcon.default,
                  rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
                }} height="30vh" width="50vh" />
                <h1 style={{ color: "#D22E2E", textAlign: "center" }}>Payment Failed!</h1>
                <br /> <br />
                <Link to="/" className="btn btn--blue" style={{ display: "flex", justifyContent: "center", margin: "0 40%" }}>Go to HomePage</Link>
              </>
            </Route>

          </Switch>
        </div>
        <Footer />
      </Fragment>
    );
  }
}

export default App;