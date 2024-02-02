const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/authModel.js'); 
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Signup route
const registerRoute = router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const payload = { userId: newUser._id };
    const jwttoken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '2h' });

    // Send the response with user information and JWT token
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      jwttoken,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Signup route error' });
  }
});

module.exports = registerRoute;


//_________________________________________________________________________________________________________________________//

// Login route

const loginRoute=router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (user) {
      console.log(user);

      //bcrypt the password is retrieved from the database
      const passwordMatch = await bcrypt.compare(password, user.password);
          if(passwordMatch)
          {

            //here jwt token is generate when user logs in so that is could contain the information related to user-> IT NEED THREE PARAMETERS ie, user, secret_key, exprire time
            const jwttoken = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {expiresIn:'2h'});
            res.json({
              status: "success",
              message:"you have logged in succesfully",
              jwttoken,
              user: { name: user.name,
                id: user._id
              }
              
            })

          }

          else
          {
            res.json({
              status:"failed", 
              message:"incorrect credentials"
            })
          }

    }

    else
    {
      res.json({
        status:"failed", 
        message:"incorrect credentials"
      })
    }
    }
     catch (error) {
      console.error('Error during signup:', error);
  
      res.status(500).json({ message: 'signup route error' });
    }
  });
    
module.exports = {registerRoute , loginRoute};