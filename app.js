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

//for creating token
const jwt = require("jsonwebtoken");

//login endpoint
app.post("/login", async (req, res) => {
  try {
    // Check if both email and password are provided
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Please provide both email and password" });
    }

    // Check if user with given email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userEmail: user.email },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "24h" }
    );

    // Successful login response
    res.status(200).json({
      message: "Login successful",
      email: user.email,
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
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
