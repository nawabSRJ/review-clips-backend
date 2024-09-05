import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import userModel from './models/users.js';
import Review from './models/Review.js';

import mongodbURL from './config.js';

const port = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(cookieParser());



// Setup CORS to allow only your frontend URL

const corsOptions = {
  origin: 'https://reviewclips.netlify.app',  // frontend URL
  optionsSuccessStatus: 200,
  methods: ["POST", "GET"],
  credentials: true
};
app.use(cors(corsOptions));


mongoose.connect(`${mongodbURL}/ReviewClips`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: "We need token, please provide it!" });
  } else {
    jwt.verify(token, "our-token-key", (err, decoded) => {
      if (err) {
        return res.json({ message: "Authentication Error" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};


app.get('/', verifyUser, (req, res) => {
  return res.json({ status: "Success", email: req.email });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // key : var (destructured above)
  userModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          const token = jwt.sign({ email }, 'our-token-key', { expiresIn: '1d' });
          res.cookie('token', token);
          return res.status(200).json({ message: "Success", user });
        }
        else {
          res.status(401).json("Incorrect Password")
        }
      } else {
        return res.json({message : "No record found"})
      }

    })
    .catch(err => res.json(err));
})

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ status: "Success", message: "Logged out successfully" });
});


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



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
