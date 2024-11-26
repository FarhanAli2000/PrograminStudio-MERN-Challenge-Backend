const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose"); // Ensure mongoose is required
const connectDB = require("./config/db");
require("dotenv").config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  favorites: Array,
});

const User = mongoose.model("User", userSchema);


// Register Route
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, favorites: [] });
    await newUser.save();
    res.status(201).send("User Registered");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid Credentials");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
});

// Add to Favorites
app.post("/favorites", async (req, res) => {
  try {
    const { token, movie } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded.id);
    user.favorites.push(movie);
    await user.save();
    res.status(200).send("Added to Favorites");
  } catch (error) {
    console.error(error);
    res.status(401).send("Invalid Token");
  }
});

// Get User Favorites
app.get("/favorites", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded.id);
    res.json(user.favorites);
  } catch (error) {
    console.error(error);
    res.status(401).send("Invalid Token");
  }
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
