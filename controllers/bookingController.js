const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("./../model/tourModel");
const APIFeatures = require('../utils/apiFeatures');
const Booking = require('../model/bookingModel');
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: 'payment',
    success_url: `http://localhost:3000/confirm/?tour=${req.params.tourId}&name=${tour.name}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `http://localhost:3000/failed`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: "inr",
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const newBooking = await Booking.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      bookings: newBooking
    }
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  let query = Booking.findById(req.params.id);
  if (popOptions) query = query.populate(popOptions);
  const booking = await query;

  if (!booking) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  // To allow for nested GET reviews on tour (hack)
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const features = new APIFeatures(Booking.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // const doc = await features.query.explain();
  const bookings = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    result: bookings.length,
    data: {
      bookings
    }
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const doc = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {

  const doc = await Booking.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new appError('No document found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  })
});