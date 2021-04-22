const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../Routes/reviewRoutes');

const router = express.Router();

//router.param('id', tourController.checkID);


//POST /tour/id of tour/reviews
//GET /tour/id of tour/reviews
//GET /tour/id of tour/reviews/id of review
// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect, 
//         authController.restrictTo('user'),
//         reviewController.createReview
//     );

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTour);
router.route('/monthly-plan/:year').get(tourController.aliasTopTours, tourController.getMonthlyPlan);


router
    .route('/')
    .get(tourController.getAllTour)
    .post(tourController.createNewTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour,
        )
    .delete(
        authController.protect, 
        authController.restrictTo('admin'), 

        tourController.deleteTour);

router
    .route('/tour-stats')
    .get(tourController.getTourStats);

module.exports = router;



// const express = require('express');
// const tourController = require('../controllers/tourController');
// const authController = require('./../controllers/authController');
// const reviewRouter = require('./../Routes/reviewRoutes');

// const router = express.Router();

// //router.param('id', tourController.checkID);


// //POST /tour/id of tour/reviews
// //GET /tour/id of tour/reviews
// //GET /tour/id of tour/reviews/id of review
// // router
// //     .route('/:tourId/reviews')
// //     .post(
// //         authController.protect, 
// //         authController.restrictTo('user'),
// //         reviewController.createReview
// //     );

// router.use('/:tourId/reviews', reviewRouter);

// router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTour);
// router
//     .route('/monthly-plan/:year')
//     .get(
//         authController.protect, 
//         authController.restrictTo('admin', 'lead-guide', 'guide'), 
//         tourController.aliasTopTours,
//         tourController.getMonthlyPlan
//     );


// router
//     .route('/')
//     .get(tourController.getAllTour)
//     .post(
//         authController.protect, 
//         authController.restrictTo('admin', 'lead-guide'),
//         tourController.createNewTour
//     );

// router
//     .route('/:id')
//     .get(tourController.getTour)
//     .patch(
//         authController.protect, 
//         authController.restrictTo('admin', 'lead-guide'), 
//         tourController.updateTour
//     )
//     .delete(
//         authController.protect, 
//         authController.restrictTo('admin', 'lead-guide'), 
//         tourController.deleteTour);

// router
//     .route('/tour-stats')
//     .get(tourController.getTourStats);

// module.exports = router;
