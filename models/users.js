// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid'); // Import UUID
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid'; // Import UUID


const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  name: String,
  email: { type: String, unique: true },
  password: String,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] // Reference to Review model
});


const userModel = mongoose.model("users", userSchema);

// module.exports = userModel;
export default userModel;       // to mitigate the deployment error
