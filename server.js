import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userModel from './models/users.js';
import Review from './models/Review.js';

import mongodbURL from './config.js';

const port = process.env.PORT || 8000;
const app = express();
app.use(express.json());



// Setup CORS to allow only your frontend URL
const corsOptions = {
  origin: 'https://reviewclips.netlify.app',  // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));



mongoose.connect(`${mongodbURL}/ReviewClips`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post('/login' , (req , res) =>{
    const {email , password} = req.body;
                    // key : var (destructured above)
    userModel.findOne({email:email})
    .then(user =>{
        if(user){
            if(user.password === password){
                res.status(200).json({ message: "Success", user });
            }
            else{
                res.status(401).json("Incorrect Password")
            }
        }else{
            res.json("No record found")
        }
        
    })
    .catch(err => res.json(err));
})



app.post('/register', (req, res) => {
  userModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err));
});


// Receive review logic (new)
app.post('/review/:uniqueId', (req, res) => {
  const { uniqueId } = req.params;
  const { name, feedback, image } = req.body;

  Review.create({ name, feedback, image, userId: uniqueId })
    .then(review => {
      // Update the user with the new review's ID
      return userModel.findOneAndUpdate(
        { _id: uniqueId },  // Assuming uniqueId corresponds to the user's _id
        { $push: { reviews: review._id } },
        { new: true }  // Returns the updated user
      );
    })
    .then(user => {
      if (user) {
        res.json({ message: "Review saved successfully!", user });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch(err => {
      console.error('Error saving review:', err);
      res.status(500).json({ message: "Failed to save review", error: err.message });
    });
});





// to fetch the user's data by their userId, including their reviews:
app.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  userModel.findOne({ _id: userId })
    .populate('reviews')  // Populate reviews field with review details
    .then(user => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch(err => res.status(500).json(err));
});









// for test
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
