import axios from 'axios';
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe('pk_test_51IhysNSDWX5xnbf6toZyLbS8bOIPvfaFczP2lthRMHc7kDrWVTXC8cxaVY9nCEd9ncX73XMF0uuX6ZTXsqVuQaa800vZe8eq5E');

<script src="https://js.stripe.com/v3/"></script>

export const bookTour = async tourId => {
  var data = JSON.parse(localStorage.getItem("userInfo"));
  const config = { headers: { "content-type": "application/json", Authorization: `Bearer ${data.token}` } }
  const stripe = await stripePromise;
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://localhost:5000/api/v1/bookings/checkout-session/${tourId}`, config
    );

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err.message);
  }
};