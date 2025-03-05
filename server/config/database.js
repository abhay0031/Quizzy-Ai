const mongoose = require("mongoose")
require("dotenv").config();

exports.connectToDB = () => {
    mongoose.connect("mongodb+srv://Myusername:admin@mycluster.stkyauo.mongodb.net/quizzy?retryWrites=true&w=majority&appName=MyCluster",{})
    .then(() => {
        console.log("Database connection successfull")
    })
    .catch((e) => {
        console.log("Error occurred while connecting to DB")
        console.error(e);
        process.exit(1);
    })
} 