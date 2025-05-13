const mongoose = require("mongoose");
require("dotenv").config();

exports.connectToDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/quizzy";
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Successfully connected to the database");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
};
