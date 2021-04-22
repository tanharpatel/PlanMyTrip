const Review = require('./../model/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getmanageReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = {tour: req.params.tourId};

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    //Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id; 

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});

exports.getReview = catchAsync(async(req,res,next)=>{

    console.log(req.params);
    const review = await Review.findById(req.params.id);
    if(!review){                                      //for fetching user document 
        return next(new appError('No review find with that id',404));
    }
    res.status(200).json({
    status:'success',
    data:{
        review
        }
    });
});

exports.updateReview = catchAsync(async (req, res, next) =>{
    const review = await Tour.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    })
    
    if(!review){
        return next(new appError('No review found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if(!review){
        return next(new appError('No review found with that ID', 404));
    }
    
    res.status(204).json({
        status: "success",
        data: null
    })
});

// const Review = require('./../model/reviewModel');
// //const catchAsync = require('../utils/catchAsync');
// const factory = require('./../controllers/handlerFactory');

// // exports.getAllReviews = catchAsync(async (req, res, next) => {
// //     let filter = {};
// //     if (req.params.tourId) filter = {tour: req.params.tourId};

// //     const reviews = await Review.find(filter);

// //     res.status(200).json({
// //         status: 'success',
// //         results: reviews.length,
// //         data: {
// //             reviews
// //         }
// //     });
// // });

// exports.setTourUserIds = (req, res, next) =>{
//     //Allow nested routes
//     if(!req.body.tour) req.body.tour = req.params.tourId;
//     if(!req.body.user) req.body.user = req.user.id; 
//     next();
// }

// // exports.createReview = catchAsync(async (req, res, next) => {
// //     // //Allow nested routes
// //     // if(!req.body.tour) req.body.tour = req.params.tourId;
// //     // if(!req.body.user) req.body.user = req.user.id; 

// //     const newReview = await Review.create(req.body);

// //     res.status(201).json({
// //         status: 'success',
// //         data: {
// //             review: newReview
// //         }
// //     });
// // });
// exports.getAllReviews = factory.getAll(Review);
// exports.getReview = factory.getOne(Review);
// exports.createReview = factory.createOne(Review);
// exports.deleteReview = factory.deleteOne(Review);
// exports.updateReview = factory.updateOne(Review);