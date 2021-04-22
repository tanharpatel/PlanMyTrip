// const express = require("express");
// const app = express();
// const cors = require("cors");
// const mongoose = require("mongoose");

// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb+srv://tanha:123@cluster0.ehdiv.mongodb.net/tripDB");

// app.use("/", require("./routes/userRoutes"));

// app.listen(5000, function() {
//   console.log("express server is running on port 5000");
// })

const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT REJECTION! Shutting down...');
    console.log(err);
    process.exit(1);
});

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE;
//console.log(app.get(env))
mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false

}).then(con =>{
    //console.log(con.connections);
    console.log('DB connection successful');
    //console.log(process.env);
})

const port = process.env.PORT || 5000;
const server = app.listen(port, ()=>{
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log(err);
    console.log('UNHANDLED REJECTION! Shutting down...');
    
    server.close(()=>{
        process.exit(1);
    });
});