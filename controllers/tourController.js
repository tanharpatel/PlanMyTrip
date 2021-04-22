const appError = require('../utils/appError');
const Tour = require('../model/tourModel');
const APIFeatues = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  };
  
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
  });
  
  exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]);
  
  // upload.single('image') req.file
  // upload.array('images', 5) req.files
  
  exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
  
    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`client/public/img/tours/${req.body.imageCover}`);
  
    // 2) Images
    req.body.images = [];
  
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
  
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`client/public/img/tours/${filename}`);
  
        req.body.images.push(filename);
      })
    );
  
    next();
  });

exports.aliasTopTours = (req, res, next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTour = catchAsync(async (req, res, next)=>{
    console.log(req.query);
    //1A) FILTERING BUILD QUERY
    // const queryObj = {...req.query};
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);

    // //1B) ADVANCED FILTERING
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // let query = Tour.find(JSON.parse(queryStr));

    //2)SORTING
    // if(req.query.sort){
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     console.log(sortBy);
    //     query = query.sort(sortBy);
    // } else{
    //     query = query.sort('-createdAt');
    // }

    //FIELD LIMITING
    // if(req.query.fields){
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields);
    // } else{
    //     query = query.select('-__v');
    // }

    //PAGINATION
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if(req.query.page) {
    //     const numTours = await Tour.countDocuments();
    //     if(skip >= numTours) throw new Error("This page does not exist");
    // }

    //EXECUTE QUERY
    const features = new APIFeatues(Tour.find(),req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;
    // const tours = await Tour.find({
    //     difficulty: 'easy',
    //     duration: 5
    // });

    // const tours = await Tour.find()
    //     .where('duration')
    //     .equals(5)
    //     .where('difficulty')
    //     .equals('easy');

//SEND RESPONSE
res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
        tours
    }
})
});

exports.getTour = catchAsync(async(req,res,next)=>{

    console.log(req.params);
    const tour=await Tour.findById(req.params.id).populate('reviews');
    if(!tour){                                      //for fetching user document 
        return next(new appError('No tour find with that id',404));
    }
    res.status(200).json({
    status:'success',
    data:{
        tour
        }
    });
});

exports.createNewTour = catchAsync(async (req, res, next)=>{
    
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });

    // try{
    //      // const newTour = new Tour({});
    //      // newTour.save();

    
    // } catch (err) {
    //     res.status(404).json({
    //         status: 'Fail',
    //         message: err
    //     });
    // }
    
});

exports.updateTour = catchAsync(async (req, res, next) =>{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    })
    
    if(!tour){
        return next(new appError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
});

exports.deleteTour = catchAsync(async (req, res, next) =>{

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour){
        return next(new appError('No tour found with that ID', 404));
    }

        res.status(204).json({
            status: 'success',
            data: null
        })
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {ratingsAverage : {$gte: 4.5}}
        },
        {
            $group: {
                _id: {$toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            }
        },
        {
            $sort: {avgPrice: 1}
        },
        // {
        //     $match: {_id: {$ne: 'EASY'}}
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
});

exports.getMonthlyPlan = catchAsync(async (req, res, next)=> {
    console.log(req.params);
    const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStarts: -1}
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
});


// //const appError = require('../utils/appError');
// const Tour = require('../model/tourModel');
// const catchAsync = require('../utils/catchAsync');
// const factory = require('./../controllers/handlerFactory');

// // const tours = JSON.parse(
// //     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// // );

// exports.aliasTopTours = (req, res, next)=>{
//     req.query.limit = '5';
//     req.query.sort = '-ratingsAverage,price';
//     req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//     next();
// }

// // exports.getAllTour = catchAsync(async (req, res, next)=>{
// //     //1A) FILTERING BUILD QUERY
// //     // const queryObj = {...req.query};
// //     // const excludedFields = ['page', 'sort', 'limit', 'fields'];
// //     // excludedFields.forEach(el => delete queryObj[el]);

// //     // //1B) ADVANCED FILTERING
// //     // let queryStr = JSON.stringify(queryObj);
// //     // queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, match => `$${match}`);
// //     // console.log(JSON.parse(queryStr));

// //     // let query = Tour.find(JSON.parse(queryStr));

// //     //2)SORTING
// //     // if(req.query.sort){
// //     //     const sortBy = req.query.sort.split(',').join(' ');
// //     //     console.log(sortBy);
// //     //     query = query.sort(sortBy);
// //     // } else{
// //     //     query = query.sort('-createdAt');
// //     // }

// //     //FIELD LIMITING
// //     // if(req.query.fields){
// //     //     const fields = req.query.fields.split(',').join(' ');
// //     //     query = query.select(fields);
// //     // } else{
// //     //     query = query.select('-__v');
// //     // }

// //     //PAGINATION
// //     // const page = req.query.page * 1 || 1;
// //     // const limit = req.query.limit * 1 || 100;
// //     // const skip = (page - 1) * limit;

// //     // query = query.skip(skip).limit(limit);

// //     // if(req.query.page) {
// //     //     const numTours = await Tour.countDocuments();
// //     //     if(skip >= numTours) throw new Error("This page does not exist");
// //     // }

// //     //EXECUTE QUERY
// //     const features = new APIFeatues(Tour.find(),req.query)
// //         .filter()
// //         .sort()
// //         .limitFields()
// //         .paginate();

// //     const tours = await features.query;
// //     // const tours = await Tour.find({
// //     //     difficulty: 'easy',
// //     //     duration: 5
// //     // });

// //     // const tours = await Tour.find()
// //     //     .where('duration')
// //     //     .equals(5)
// //     //     .where('difficulty')
// //     //     .equals('easy');

// // //SEND RESPONSE
// // res.status(200).json({
// //     status: 'success',
// //     result: tours.length,
// //     data: {
// //         tours
// //     }
// // })
// // });
// // catchAsync(async(req,res,next)=>{

// //     console.log(req.params);
// //     const tour=await Tour.findById(req.params.id).populate('reviews');
// //     if(!tour){                                      //for fetching user document 
// //         return next(new appError('No tour find with that id',404));
// //     }
// //     res.status(200).json({
// //     status:'success',
// //     data:{
// //         tour
// //         }
// //     });
// // });

// // exports.createNewTour = catchAsync(async (req, res, next)=>{
    
// //     const newTour = await Tour.create(req.body);

// //     res.status(201).json({
// //         status: 'success',
// //         data: {
// //             tour: newTour
// //         }
// //     });

// //     // try{
// //     //      // const newTour = new Tour({});
// //     //      // newTour.save();

    
// //     // } catch (err) {
// //     //     res.status(404).json({
// //     //         status: 'Fail',
// //     //         message: err
// //     //     });
// //     // }
    
// // });
// exports.createNewTour = factory.createOne(Tour);
// exports.updateTour = factory.updateOne(Tour);
// exports.deleteTour = factory.deleteOne(Tour);
// exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getAllTour = factory.getAll(Tour);
// // exports.deleteTour = catchAsync(async (req, res, next) =>{

// //     const tour = await Tour.findByIdAndDelete(req.params.id);

// //     if(!tour){
// //         return next(new appError('No tour found with that ID', 404));
// //     }

// //         res.status(204).json({
// //             status: 'success',
// //             data: null
// //         })
// // });

// exports.getTourStats = catchAsync(async (req, res, next) => {
//     const stats = await Tour.aggregate([
//         {
//             $match: {ratingsAverage : {$gte: 4.5}}
//         },
//         {
//             $group: {
//                 _id: {$toUpper: '$difficulty'},
//                 numTours: {$sum: 1},
//                 numRatings: {$sum: '$ratingsQuantity'},
//                 avgRating: {$avg: '$ratingsAverage'},
//                 avgPrice: {$avg: '$price'},
//                 minPrice: {$min: '$price'},
//                 maxPrice: {$max: '$price'}
//             }
//         },
//         {
//             $sort: {avgPrice: 1}
//         },
//         // {
//         //     $match: {_id: {$ne: 'EASY'}}
//         // }
//     ]);
//     res.status(200).json({
//         status: 'success',
//         data: {
//             stats
//         }
//     })
// });

// exports.getMonthlyPlan = catchAsync(async (req, res, next)=> {
//     console.log(req.params);
//     const year = req.params.year * 1;
//         const plan = await Tour.aggregate([
//             {
//                 $unwind: '$startDates'
//             },
//             {
//                 $match: {
//                     startDates: {
//                         $gte: new Date(`${year}-01-01`),
//                         $lte: new Date(`${year}-12-31`)
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { $month: '$startDates' },
//                     numTourStarts: {$sum: 1},
//                     tours: {$push: '$name'}
//                 }
//             },
//             {
//                 $addFields: {month: '$_id'}
//             },
//             {
//                 $project: {
//                     _id: 0
//                 }
//             },
//             {
//                 $sort: {numTourStarts: -1}
//             },
//             {
//                 $limit: 12
//             }
//         ]);

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 plan
//             }
//         })
// });