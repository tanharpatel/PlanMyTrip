// //review/rating/createdAt/ref to tour/ref to user
// const mongoose = require('mongoose');

// const reviewSchema = new mongoose.Schema({
//         review: {
//             type: String,
//             required: [true, 'Review cannot be empty.']
//         },
//         ratting: {
//             type: Number,
//             min: 1,
//             max: 5
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now()
//         },
//         tour: {
//             type: mongoose.Schema.ObjectId,
//             ref: 'Tour',
//             required: [true, 'Review must belong to a tour.']
//         },
//         user: {
//             type: mongoose.Schema.ObjectId,
//             ref: 'User',
//             required: [true, 'Review must belong to a user.']
//         }
// },
// {
//     toJSON: {virtuals: true},
//     toObject: {virtuals: true}
// });

// reviewSchema.pre(/^find/, function(next){
//     // this.populate({
//     //     path: 'tour',
//     //     select: 'name'
//     //  }).populate({
//     //      path: 'user',
//     //      select: 'name photo'
//     //  });
//     this.populate({
//         path: 'user',
//         select: 'name photo'
//     });
//      next();
// });

// const Review = mongoose.model('Review', reviewSchema);

// module.exports = Review;

// //POST /tour/id of tour/reviews
// //GET /tour/id of tour/reviews
// //GET /tour/id of tour/reviews/id of review

//review/rating/createdAt/ref to tour/ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
        review: {
            type: String,
            required: [true, 'Review cannot be empty.']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.']
        },
        tourName: {
            type: String,
            required: [true, "Tour name cannot be empty."]
        }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    //  })
    //.populate({
    //      path: 'user',
    //      select: 'name photo'
    //  });
    this.populate({
        path: 'user',
        select: 'name photo'
    });
     next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ]);
    //console.log(stats);
    if(stats.length > 0 ){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0 
        });
    }
}

reviewSchema.post('save', function() {
    //this points to the current review
    //this.constructor points to currents model
    this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.rev = await this.findOne();
    //console.log(this.rev);
    next()
});
reviewSchema.post(/^findOneAnd/, async function() {
    //await this.findOne(); does not work here as query has already beeen executed
    await this.rev.constructor.calcAverageRatings(this.rev.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

//POST /tour/id of tour/reviews
//GET /tour/id of tour/reviews
//GET /tour/id of tour/reviews/id of review