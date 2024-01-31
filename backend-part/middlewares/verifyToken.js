require('dotenv').config();
const jwt = require("jsonwebtoken");
const User = require('../models/authModel.js'); 





//we have two conditions
//condition-1) TOKEN IS ABSENT
//condition-2) TOKEN IS PRESENT
// if token is present then again we going to have two conditions
//condition-1)TOKEN IS MATCHED
//condition-2)TOKEN IS NOT MATCHED



// const authenticateUser=(req, res, next) => {
//   const token = req.header('Authorization');

//   //condition -1) when token is absent

//   if(!token)
//   {
//     return res.status(401).json({message: 'token is absent'})
//   }

//   //condition -2) when token is present

//   else{
//     try{
//       //if token matches
//       const decoded = jwt.verify(token, process.env.SECRET_KEY);
//       //if above token stored in "decoded" is same as req.body.user
//       req.body.user=decoded.user;
//       next();


//     }
//     //if token does not matches
//     catch(err){
//          console.log(err);
//          return res.status(404).json({message: 'token is present but is not matching'});
//     }
//   }
// }


const authenticate = async (req, res, next) => {
  try {
    // Retrieve the JWT token from headers, cookies, etc.
 const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized - Token missing' });
  }

  const token = authorizationHeader.split(' ')[0];
  console.log('Received token:', token);

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY); 
        console.log(decoded);

    // Find the user based on the decoded token info (e.g., user ID)
    const user = await User.findById(decoded._id);

    // Attach the user to the request object for further use
    req.user = user;

    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authenticate;
