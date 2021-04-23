// const catchAsync = require('./../utils/catchAsync');
// const appError = require('./../utils/appError');
// const { Model } = require('mongoose');
// const APIFeatues = require('./../utils/apiFeatures');


// exports.deleteOne = Model => catchAsync(async (req, res, next) =>{

//     const doc = await Model.findByIdAndDelete(req.params.id);

//     if(!doc){
//         return next(new appError('No document found with that ID', 404));
//     }

//         res.status(204).json({
//             status: 'success',
//             data: null
//         })
// });

// exports.updateOne = Model => catchAsync(async (req, res, next) =>{
//     const doc = await Model.findByIdAndUpdate(req.params.id, req.body,{
//         new: true,
//         runValidators: true
//     })
    
//     if(!doc){
//         return next(new appError('No document found with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             data: doc
//         }
//     })
// });

// exports.createOne = Model => catchAsync(async (req, res, next)=>{
    
//     const doc = await Model.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             data: doc
//         }
//     });
// });

// exports.getOne = (Model, popOptions) => catchAsync(async(req,res,next)=>{

//     let query = Model.findById(req.params.id);

//     if(popOptions) query = query.populate(popOptions);

//     const doc = await query;
    
//     if(!doc){                                      //for fetching user document 
//         return next(new appError('No document find with that id',404));
//     }
//     res.status(200).json({
//     status:'success',
//     data:{
//         data: doc
//         }
//     });
// });

// exports.getAll = Model => catchAsync(async (req, res, next)=>{

//     //to allow nested GET reviews on tour
//     let filter = {};
//     if (req.params.tourId) filter = {tour: req.params.tourId};

//     //EXECUTE QUERY
//     const features = new APIFeatues(Model.find(filter),req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();

//     // const doc = await features.query.explain();
//     const doc = await features.query;
// res.status(200).json({
//     status: 'success',
//     result: doc.length,
//     data: {
//         data: doc
//     }
//     })
// });