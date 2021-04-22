const express = require('express');
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
    '/updateMyPassword', 
    authController.protect, 
    authController.updatePassword
);

router.patch(
    '/updateMe', 
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);

router.delete(
    '/deleteMe', 
    authController.protect, 
    userController.deleteMe
);

router
    .route('/')
    .get(userController.getmanageUsers)
    .post(userController.createNewUser);

router
    .route('/login')
    .get(authController.login);

router
    .route('/signup')
    .get(authController.signup);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(
        authController.protect, 
        authController.restrictTo('admin'),
        userController.deleteUser);

module.exports = router;


// const express = require('express');
// const userController = require('../controllers/userController');
// const authController = require('./../controllers/authController');

// const router = express.Router();

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);
// router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetPassword/:token', authController.resetPassword);

// //protect all routes after this middleware
// router.use(authController.protect); 

// router.patch(
//     '/updateMyPassword', 
//     authController.updatePassword
//  );

// router.get(
//     '/me',
//     userController.getMe,
//     userController.getUser
// )

// router.patch(
//     '/updateMe', 
//     userController.updateMe
// );
// router.delete(
//     '/deleteMe', 
//     userController.deleteMe
// );

// router.use(authController.restrictTo('admin'));
// router
//     .route('/')
//     .get(userController.getAllUsers)
//     .post(userController.createNewUser);

// router
//     .route('/:id')
//     .get(userController.getUser)
//     .patch(userController.updateUser)
//     .delete(userController.deleteUser);

// module.exports = router;