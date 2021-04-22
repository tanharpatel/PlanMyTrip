const appError = require('./../utils/appError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new appError(message, 400);
}

const handleDuplicateFieldsDB = err => {
	const value = err.keyValue.name;  
	const message = `Duplicate field value: ${value}. Please use another value!`;
	return new appError(message, 400);
};

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);
  
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new appError(message, 400);
  };

const handleJWTError = () => new appError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new appError('Your token has expired. Please log in again!', 401);


const sendErrorDev = (err, res)=>{
    console.log(err.name);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res)=>{
    //Operational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } 

    //Programming or other unknown error: don't leak error details
    else{
        //1)Log error
        console.error('ERROR', err);

        //2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        })
    }
}

module.exports = (err, req, res, next)=>{

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV == 'development'){
        sendErrorDev(err, res);
    } else if(process.env.NODE_ENV == 'production'){
        let error = {...err};
        if(error.kind === 'ObjectId') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error._message === 'Tour validation failed')  error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
}


// const appError = require('./../utils/appError')

// const handleCastErrorDB = err => {
//     const message = `Invalid ${err.path}: ${err.value}.`;
//     return new appError(message, 400);
// }

// const handleDuplicateFieldsDB = err => {
// 	const value = err.keyValue.name;  
// 	const message = `Duplicate field value: ${value}. Please use another value!`;
// 	return new appError(message, 400);
// };

// const handleValidationErrorDB = err => {
// 	const errors = Object.values(err.errors).map(el => el.message);
  
// 	const message = `Invalid input data. ${errors.join('. ')}`;
// 	return new appError(message, 400);
//   };

// const handleJWTError = () => new appError('Invalid token. Please log in again!', 401);
// const handleJWTExpiredError = () => new appError('Your token has expired. Please log in again!', 401);


// const sendErrorDev = (err, res)=>{
//     console.log(err.name);
//     res.status(err.statusCode).json({
//         status: err.status,
//         error: err,
//         message: err.message,
//         stack: err.stack
//     });
// }

// const sendErrorProd = (err, res)=>{
//     //Operational, trusted error: send message to client
//     if(err.isOperational){
//         res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message
//         });
//     } 

//     //Programming or other unknown error: don't leak error details
//     else{
//         //1)Log error
//         console.error('ERROR', err);

//         //2) Send generic message
//         res.status(500).json({
//             status: 'error',
//             message: 'Something went wrong'
//         })
//     }
// }

// module.exports = (err, req, res, next)=>{

//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     if(process.env.NODE_ENV == 'development'){
//         sendErrorDev(err, res);
//     } else if(process.env.NODE_ENV == 'production'){
//         let error = {...err};
//         if(error.kind === 'ObjectId') error = handleCastErrorDB(error);
//         if(error.code === 11000) error = handleDuplicateFieldsDB(error);
//         if (error._message === 'Tour validation failed')  error = handleValidationErrorDB(error);
//         if(error.name === 'JsonWebTokenError') error = handleJWTError();
//         if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();

//         sendErrorProd(error, res);
//     }
// }