const axios = require("axios");

const fetchMovies = async (req, res) => {
  try {
    const { term = "star", limit = 10, offset = 0, sort } = req.query;
    const response = await axios.get(
      `https://itunes.apple.com/search?term=${term}&media=movie&limit=${limit}&offset=${offset}`
    );

    let movies = response.data.results;

    // Apply sorting by price if specified
    if (sort === "price") {
      movies = movies.sort((a, b) => {
        const priceA = a.trackPrice ?? 0; // Default to 0 if undefined
        const priceB = b.trackPrice ?? 0;
        return priceA - priceB; // Ascending order
      });
    }

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies", error });
  }
};

module.exports = { fetchMovies };
