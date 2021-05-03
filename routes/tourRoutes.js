const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../Routes/reviewRoutes');
const router = express.Router();

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
    .patch(tourController.updateTour)
    .delete(
        authController.protect, 
        authController.restrictTo('admin'),
        tourController.deleteTour);

router
    .route('/tour-stats')
    .get(tourController.getTourStats);

module.exports = router;