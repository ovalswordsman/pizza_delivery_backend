const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnection() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database connection is successful!");
  } catch (error) {
    console.log("Connection failed!");
  }
}

module.exports = dbConnection;
