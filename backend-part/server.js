
const express=require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const quizRouter = require("./routes/quizRoute.js");


// const {registerRoute, loginRoute} = require("./routes/authRoute.js");
// const loginRoute = require("./routes/authRoute.js");
const {registerRoute, loginRoute} = require("./routes/authRoute.js");


require('dotenv').config();
const  connectDB = require("./db.js");

const app = express();

// Using body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//using cors
app.use(cors());
app.get('/api/health' , (req, res, next)=>{
    res.status(200).send({message : "Ok",status:"server is setup succesfully!!!"})

})


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Check user-provided answers for a quiz

// Create a new quiz or poll

app.use('/api', registerRoute)//->it has to be tested as /api/signup
app.use('/api', loginRoute)//-> /api/login

app.use('/api', quizRouter);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//starting the server
app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`server is running on port ${process.env.PORT}`);
});



