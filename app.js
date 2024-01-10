const express = require("express");
const app = express();

// Use body-parser middleware for JSON requests
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Database connection
const dbConnection = require("./db/dbConnection");
dbConnection();

// Creating user schema
const User = require("./db/userModel");

// Importing encryption
const bcrypt = require("bcrypt");

//login endpoint
app.post("/login", async (req, res) => {
  //Checking if email and password is present
  if (!req.body.email || !req.body.password) {
    return res.status(500).send({
      message: "Please provide both credentials!",
    });
  }

  //Checking if email is present
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({
        message: "Email does not exist!",
      });
    }

    //If user exists, comparing the password with hashed password
    try {
      const checkPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!checkPassword) {
        return res.status(500).send({
          message: "Wrong password",
        });
      }

      console.log("Login successfull");
      return res.status(201).send({
        message: "Login successfull",
      });
    } catch (error) {
      res.status(500).send({
        message: "Try again",
        error,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Server error",
      error,
    });
  }
});

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    // Checking if email already exists
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).json({
        message: "User already exists!",
      });
    }

    // Check if request body includes the "password" field
    if (!req.body.password) {
      return res.status(400).json({
        message: "Password is required in the request body",
      });
    }

    // If user does not exist, encrypting the password and saving it in MongoDB
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
    });

    const result = await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.listen(3001, () => {
  console.log("Backend is running at port 3001");
});
