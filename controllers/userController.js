const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`client/public/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.getmanageUsers = catchAsync(async (req,res,next) =>{
    const users = await User.find();
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
        result: users.length,
        data: {
            users
        }
    })
});

exports.updateMe = catchAsync(async (req,res,next) => {
    //1) create error if user post password data
    if(req.body.password || req.body.passwordConfirm){
        return next(
            new appError(
                'This route is not for password updates. Please use /updateMyPassword', 
                400
                )
            );
    }

    //2) filtered unwanted fields name that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;
    //3) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });


    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });

});

exports.deleteMe = catchAsync(async (req, res, next) =>{
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.createNewUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};

exports.getUser = catchAsync(async(req,res,next)=>{

    console.log(req.params);
    const user = await User.findById(req.params.id);
    if(!user){                                      //for fetching user document 
        return next(new appError('No user find with that id',404));
    }
    res.status(200).json({
    status:'success',
    data:{
        user
        }
    });
});

exports.updateUser = catchAsync(async (req, res, next) =>{
    const user = await User.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    })
    
    if(!user){
        return next(new appError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});

exports.deleteUser = catchAsync(async (req,res, next) =>{
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user){
        return next(new appError('No tour found with that ID', 404));
    }

        res.status(204).json({
            status: 'success',
            data: null
        })
});


// const User = require('../model/userModel');
// const catchAsync = require('../utils/catchAsync');
// const appError = require('./../utils/appError');
// const factory = require('./../controllers/handlerFactory');

// const filterObj = (obj, ...allowedFields) =>{
//     const newObj = {};
//     Object.keys(obj).forEach(el => {
//         if(allowedFields.includes(el)) newObj[el] = obj[el];
//     });
//     return newObj;
// }

// // exports.getAllUsers = catchAsync(async (req,res,next) =>{
// //     const users = await User.find();
// //     // const tours = await Tour.find({
// //     //     difficulty: 'easy',
// //     //     duration: 5
// //     // });

// //     // const tours = await Tour.find()
// //     //     .where('duration')
// //     //     .equals(5)
// //     //     .where('difficulty')
// //     //     .equals('easy');

// //     //SEND RESPONSE
// //     res.status(200).json({
// //         status: 'success',
// //         result: users.length,
// //         data: {
// //             users
// //         }
// //     })
// // });
// exports.getMe = (req, res, next) => {
//     req.params.id = req.user.id;
//     next();
// };

// exports.updateMe = catchAsync(async (req,res,next) => {
//     //1) create error if user post password data
//     if(req.body.password || req.body.passwordConfirm){
//         return next(
//             new appError(
//                 'This route is not for password updates. Please use /updateMyPassword', 
//                 400
//                 )
//             );
//     }

//     //2) filtered unwanted fields name that are not allowed to be updated
//     const filteredBody = filterObj(req.body, 'name', 'email');

//     //3) update user document
//     const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//         new: true,
//         runValidators: true
//     });


//     res.status(200).json({
//         status: 'success',
//         data: {
//             user: updatedUser
//         }
//     });

// });

// exports.deleteMe = catchAsync(async (req, res, next) =>{
//     await User.findByIdAndUpdate(req.user.id, { active: false });

//     res.status(204).json({
//         status: 'success',
//         data: null
//     })
// });

// exports.createNewUser = (req,res) =>{
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined! Please use /signup instead.'
//     });
// };


// // (req,res) =>{
// //     res.status(500).json({
// //         status: 'error',
// //         message: 'This route is not yet defined!'
// //     });
// // };

// //do not update password
// exports.updateUser = factory.updateOne(User);
// exports.deleteUser = factory.deleteOne(User);
// exports.getUser = factory.getOne(User);
// exports.getAllUsers = factory.getAll(User);