const express = require("express");
const { fetchMovies } = require("../controllers/moviesController.js");
const router = express.Router();

// Fetch movies with optional sorting
router.get("/movies", fetchMovies);

module.exports = router;
