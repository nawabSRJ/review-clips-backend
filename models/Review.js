// const mongoose = require('mongoose');
import mongoose from "mongoose";
// const { v4: uuidv4 } = require('uuid'); // Import UUID


const reviewSchema = new mongoose.Schema({
    name: String,
    feedback: String,
    image: String,
    userId: String, // Reference to the user who requested the review
  });
  
  const Review = mongoose.model("Review", reviewSchema);
  
  // module.exports = Review;
  export default Review;        // to mitigate the deployment error
  