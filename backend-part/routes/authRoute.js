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

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    console.log("New user ID:", newUser.id); // Log the user ID


    const payload = { userId: newUser.id };
    const jwttoken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '12h' });

    res.status(201).json({ message: 'User created successfully', jwttoken, id: newUser.id });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
const loginRoute = router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }

    const payload = { userId: user.id };
    const jwttoken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '12h' });

    res.json({
      status: 'success',
      message: 'Login successful',
      jwttoken,
      user: { name: user.name, id: user.id }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { registerRoute, loginRoute };