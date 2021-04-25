const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    //remove password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1) check if email and password exist
    if (!email || !password) {
        return next(new appError('Please provide email and password', 400));
    }

    //2) check if user exist && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new appError('Incorrect email or password', 401))
    }

    //3) If everything okay, then send token to client
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    //1) get the token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    console.log(token);
    if (!token) {
        return next(new appError('You are not logged in! Please log in to get access', 401));
    }

    //2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new appError('The user belonging to this token does no longer exist', 401));
    }

    //4) check if user change password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError('User recently changed password! Please log in again.', 401));
    };

    //grant access to protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ['admin', 'lead-guide']
        console.log(req.user.role);
        if (!roles.includes(req.user.role)) {
            return next(new appError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError('There is no user with this email address', 404));
    }

    //2) generate a random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) semd it to user's email
    const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;
    const message = `Forgot the passsword? Submit a update request with your new password and passwordConfirm
     to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        console.log(err.message);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new appError('There was an error sending an email. Try again later.', 500));
    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    console.log("hi");
    //1) get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    //2) if the token has not expired and there is user then set new password
    if (!user) {
        return next(new appError('Token is invalid or expired', 400));
    }

    console.log(req.params);
    console.log(req.body);

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    console.log(req.params);

    await user.save();

    //3) update changePasswordAt property for user

    //4) log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) get user from collection
    const user = await User.findById(req.user.id).select('+password');

    //2) check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new appError('Your current password is wrong', 401));
    }

    //3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) Log user in, send JWT
    createSendToken(user, 200, res);
});


// const crypto = require('crypto');
// const { promisify } = require('util');
// const jwt = require('jsonwebtoken');
// const User = require('./../model/userModel');
// const catchAsync = require('./../utils/catchAsync');
// const appError = require('./../utils/appError');
// const sendEmail = require('./../utils/email');

// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// const createSendToken = (user, statusCode, res) => {
//   const token = signToken(user._id);
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//   };
//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

//   res.cookie('jwt', token, cookieOptions);

//   //remove password from the output
//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//     },
//   });
// };

// exports.signup = catchAsync(async (req, res, next) => {
//   const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     passwordConfirm: req.body.passwordConfirm,
//     role: req.body.role,
//   });
//   createSendToken(newUser, 201, res);
// });

// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   //1) check if email and password exist
//   if (!email || !password) {
//     return next(new appError('Please provide email and password', 400));
//   }

//   //2) check if user exist && password is correct
//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new appError('Incorrect email or password', 401));
//   }

//   //3) If everything okay, then send token to client
//   createSendToken(user, 200, res);
// });

// exports.protect = catchAsync(async (req, res, next) => {
//   //1) get the token and check of it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   console.log(token);
//   if (!token) {
//     return next(
//       new appError('You are not logged in! Please log in to get access', 401)
//     );
//   }

//   //2) Verification token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   //3) check if user still exist
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new appError('The user belonging to this token does no longer exist', 401)
//     );
//   }

//   //4) check if user change password after the token was issued
//   if (currentUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new appError('User recently changed password! Please log in again.', 401)
//     );
//   }

//   //grant access to protected route
//   req.user = currentUser;
//   next();
// });

// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     //roles ['admin', 'lead-guide']
//     console.log(req.user.role);
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new appError('You do not have permission to perform this action', 403)
//       );
//     }

//     next();
//   };
// };

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   //1) get user based on posted email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new appError('There is no user with this email address', 404));
//   }

//   //2) generate a random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   //3) semd it to user's email
//   const resetURL = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/users/resetPassword/${resetToken}`;

//   const message = `Forgot the passsword? Submit a update request with your new password and passwordConfirm
//      to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Your password reset token (valid for 10 min)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email!',
//     });
//   } catch (err) {
//     console.log(err);
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new appError('There was an error sending an email. Try again later.', 500)
//     );
//   }
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   //1) get user based on token
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   //2) if the token has not expired and there is user then set new password
//   if (!user) {
//     return next(new appError('Token is invalid or expired', 400));
//   }

//   console.log(req.params);
//   console.log(req.body);

//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   console.log(req.params);

//   await user.save();

//   //3) update changePasswordAt property for user

//   //4) log the user in, send JWT
//   createSendToken(user, 200, res);
// });

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   //1) get user from collection
//   const user = await User.findById(req.user.id).select('+password');

//   //2) check if posted current password is correct
//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new appError('Your current password is wrong', 401));
//   }

//   //3) If so, update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();

//   //4) Log user in, send JWT
//   createSendToken(user, 200, res);
// });
