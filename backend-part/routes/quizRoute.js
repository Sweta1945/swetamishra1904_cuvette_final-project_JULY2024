// quizModel.js

const express = require('express');
const router = express.Router();
const QuizModel = require('../models/quizModel.js');
const authorizationCheck = require('../middlewares/verifyToken.js')
const AnswerModel = require('../models/answerModel.js');
const  Response  = require('../models/responseModel.js');


// Correctly defining the route
router.post('/create-quizzes', authorizationCheck, async (req, res) => {
  try {
    console.log('Creator ID:', req.user._id);
    const { title, quizType, questions, pollOptions } = req.body;
    const creator = req.user._id;

    let quizData;

    if (quizType === 'poll') {
      quizData = { title, quizType, questions, creator };
    } else {
      quizData = { title, quizType, questions, creator };
    }

    console.log('Quiz Data:', quizData);
    
    const newQuiz = await QuizModel.create(quizData);

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





router.get('/total-quizzes', authorizationCheck,   async (req, res) => {
  try {
    // Log req.user to check its contents
    console.log('User Object:', req.user);

    // Check if req.user is defined and contains the _id property
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user._id;
    // Count the number of quizzes where the creator's ID matches the user's ID
    const totalQuizzes = await QuizModel.countDocuments({ creator: userId });

    res.status(200).json({ totalQuizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API to get total number of questions created
router.get('/total-questions',  authorizationCheck,  async (req, res) => {
  try {

    // Check if req.user is defined and contains the _id property
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Assuming req.user._id contains the ID of the logged-in user
    const userId = req.user._id;

    // Find all quizzes created by the user
    const quizzes = await QuizModel.find({ creator: userId }).populate('questions');
    console.log(`this is the quizesssssssssssss ${quizzes}`)
    let totalQuestions = 0;

    quizzes.forEach((quiz) => {
      // Log the quiz data to see its structure
      console.log('Quiz Data:', quiz);

      // Check if quiz.questions is defined and has length
      if (quiz.questions && quiz.questions.length>0) {
        totalQuestions += quiz.questions.length;
      }
    });

    res.status(200).json({ totalQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//api to fetch total impressions

router.get('/total-impressions', authorizationCheck, async (req, res) => {
  try {
    // Checking  if req.user is defined and contains the _id property
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Assuming req.user._id contains the ID of the logged-in user
    const userId = req.user._id;

    // Finding all quizzes created by the user
    const quizzes = await QuizModel.find({ creator: userId }).populate('impressions');
    
    let totalImpressions = 0;

    // Iterating  through each quiz and accumulate the impressions
    quizzes.forEach((quiz) => {
      // Loging  the quiz data to see its structure
      console.log('Quiz Data:', quiz);

      // Adding  the impressions count of each quiz to the total impressions
      totalImpressions += quiz.impressions || 0;
    });

    res.status(200).json({ totalImpressions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Generating sharable link and updating impression if anybody opens up the link
router.get('/:quizId', async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await QuizModel.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if the 'click' query parameter is present
    const isClick = req.query.click === 'true';
    console.log('Is click:', isClick);

    if (isClick) {
      // Increment the impressions field
      quiz.impressions += 1;

      // Save the updated quiz
      await quiz.save();
    }

    const shareableLink = `http://localhost:5173/quiz/${quizId}`;
    // Constructing the new URL with the 'click' parameter
    const newUrl = `${shareableLink}?click=true`;
    res.redirect(301, newUrl);
    

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/quiz-data/:quizId', async (req, res) => {
  const quizId = req.params.quizId;

  try {
    const quiz = await QuizModel.findById(quizId).populate('questions'); // Assuming questions are stored as references in the QuizModel
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/submit-answers/:quizId', async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await QuizModel.findById(quizId).populate('questions');

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    

    const userAnswers = req.body.userAnswers;

    // Save user's answers in the AnswerModel
    const userAnswerData = {
      quizId,
      userAnswers,
    };

    const savedAnswer = await AnswerModel.create(userAnswerData);

    // Validate and process user answers, calculate score, etc.
    const feedback = calculateFeedback(quiz.questions, userAnswers, savedAnswer);

    // Update the savedAnswer with the feedback array
    savedAnswer.feedback = feedback.map((feedbackItem) => ({
      question: feedbackItem.question,
      isCorrect: feedbackItem.isCorrect,
      correctAnswer: feedbackItem.correctAnswer,
    }));

    // Save the updated savedAnswer
    await savedAnswer.save();

    res.status(201).json({ message: 'Answers submitted successfully', feedback, savedAnswer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function calculateFeedback(questions, userAnswers) {
  console.log('Questions:', questions);
  console.log('User Answers:', userAnswers);

  const feedback = [];

  // Check if questions is defined and is an array
  if (Array.isArray(questions)) {
    questions.forEach((question, index) => {
      const userAnswerIndex = userAnswers[index]; // Get the user's answer index
      
      // Log question and answer for debugging
      console.log('Question:', question);
      console.log('User Answer Index:', userAnswerIndex);

      // Ensure the user provided an answer for the current question
      if (userAnswerIndex !== undefined && userAnswerIndex >= 0 && userAnswerIndex < question.options.length) {
        const correctAnswerIndex = question.correctAnswerIndex; // Get the index of the correct answer

        // Log correct answer index for debugging
        console.log('Correct Answer Index:', correctAnswerIndex);

        const isCorrect = userAnswerIndex === correctAnswerIndex;
        feedback.push({ question: question.questionText, isCorrect, correctAnswer: question.options[correctAnswerIndex] });
      } else {
        // Handle the case where the user did not provide a valid answer
        feedback.push({ question: question.questionText, isCorrect: false, correctAnswer: question.options[question.correctAnswerIndex] });
      }
    });
  } else {
    console.error('Questions is undefined or not an array:', questions);
    // Optionally, you can handle this situation, e.g., return an error message or an empty feedback array
  }

  console.log('Feedback:', feedback); // Log feedback for debugging

  return feedback;
}




// Assuming you have a function to fetch a quiz by ID, something like this:

const getQuizById = async (quizId) => {
  try {
    const quiz = await QuizModel.findById(quizId);
    return quiz;
  } catch (error) {
    throw new Error(`Error fetching quiz: ${error.message}`);
  }
};

// Now, when sending the response:

// router.get('/all-info/:id', async (req, res) => {
//   const quizId = req.params.id;

//   try {
//     // Use populate to retrieve the detailed information of questions
//     const quiz = await QuizModel.findById(quizId).populate('questions');

//     // Check if quiz exists
//     if (!quiz) {
//       return res.status(404).json({ error: 'Quiz not found' });
//     }

//     // Ensure consistent response structure
//     const response = {
//       id: quiz.id,
//       title: quiz.title,
//       quizType: quiz.quizType,
//       questions: (quiz.questions || []).map((question) => ({
//         id: question._id,  // Assuming question ID is stored in '_id'
//         questionText: question.questionText,
//         options: question.options || [],  // Use actual options if available, otherwise, an empty array
//         correctAnswer: question.correctAnswer,
//         timer: question.timer || null,  // Use actual timer if available, otherwise, null
//       })),
//     };

//     res.json(response);
//     console.log(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


router.get('/all-info/:id', async (req, res) => {
  const quizId = req.params.id;

  try {
    // Increment the impression count
    const updatedQuiz = await QuizModel.findByIdAndUpdate(quizId, { $inc: { impressions: 1 } });
    console.log('Impression count:', updatedQuiz.impressions);


    // Use populate to retrieve the detailed information of questions
    const quiz = await QuizModel.findById(quizId).populate('questions');

    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Ensure consistent response structure
    const response = {
      id: quiz.id,
      title: quiz.title,
      quizType: quiz.quizType,
      questions: (quiz.questions || []).map((question) => ({
        id: question._id,  // Assuming question ID is stored in '_id'
        questionText: question.questionText,
        options: question.options || [],  // Use actual options if available, otherwise, an empty array
        correctAnswer: question.correctAnswer,
        timer: question.timer || null,  // Use actual timer if available, otherwise, null
      })),
    };

    res.json(response);
    console.log(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API to get trending quizzes ranked by total impressions
router.get('/trending-quizzes/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Query the database to find quizzes sorted by impressions for the given user
    const quizzes = await QuizModel.find({ creator: userId })
      .sort({ impressions: -1 }) // Sort in descending order of impressions
      .select('title impressions _id quizType') // Select title, impressions, and _id fields
      .exec();

    // Check if any quizzes are found
    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found for the user.' });
    }

    // Format the createdAt timestamp for each quiz
    const formattedQuizzes = quizzes.map((quiz) => ({
      id:quiz._id,
      quizType:quiz.quizType,
      title: quiz.title,
      impressions: quiz.impressions,
      createdDate: formatDate(quiz._id.getTimestamp())
    }));

    // Return the sorted list of quizzes
    res.status(201).json(formattedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Helper function to format date in "4 Sept, 2023" format
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}



// DELETE route to delete a quiz by ID
router.delete('/delete-quiz/:quizId', async (req, res) => {
  const quizId = req.params.quizId;

  try {
    // Find the quiz by ID and delete it
    const deletedQuiz = await QuizModel.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    res.status(200).json({ message: 'Quiz deleted successfully.' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});// PUT route to edit a quiz by ID
router.put('/edit-quiz/:quizId', async (req, res) => {
  const quizId = req.params.quizId;
  const { title, quizType, questions } = req.body;

  try {
    // Find the quiz by ID and populate the questions field
    const existingQuiz = await QuizModel.findById(quizId).populate('questions');

    if (!existingQuiz) {
      return res.status(404).json({
        message: 'Quiz not found.'
      });
    }

    // Store previous quiz data
    const previousQuizData = {
      title: existingQuiz.title,
      quizType: existingQuiz.quizType,
      questions: existingQuiz.questions.map(question => ({
        questionText: question.questionText,
        options: [...question.options], // Copy options array
        correctAnswer: question.correctAnswer,
        timer: question.timer
      }))
    };

    // Update the quiz details
    existingQuiz.title = title || existingQuiz.title;
    existingQuiz.quizType = quizType || existingQuiz.quizType;
    existingQuiz.questions = questions || existingQuiz.questions;

    // Save the updated quiz
    const updatedQuiz = await existingQuiz.save();

    res.status(200).json({
      message: 'Quiz updated successfully.',
      previousQuizData: previousQuizData, // Include previous quiz data in the response
      updatedQuiz: updatedQuiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      message: 'Internal server error.'
    });
  }
});


// API endpoint to handle response submission
router.post('/submit-response', async (req, res) => {
  try {
    const { quizId, quizTitle, questions } = req.body;

    // Construct an array to store responses for each question
    const responses = questions.map((question) => ({
      name: question.questionName, // Corrected field name
      selectedOption: question.selectedOption,
      isCorrect: question.isCorrect,
    }));

    // Construct response document
    const response = new Response({
      quizId,
      quizTitle,
      questions: responses,
    });

    // Save the response to MongoDB
    await response.save();

    res.status(201).json({ message: "Response submitted successfully" });
  } catch (error) {
    console.error("Error storing response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET request to retrieve total responses, correct responses, and incorrect responses for a specific quiz ID
router.get('/quiz/response/stats/:quizId', async (req, res) => {
  try {
      const quizId = req.params.quizId;

      // Find all responses for the given quiz ID
      const responses = await Response.find({ quizId });

      // Initialize counters for total, correct, and incorrect responses
      let totalResponses = responses.length;
      let totalCorrect = 0;
      let totalIncorrect = 0;

      // Iterate through each response
      for (const response of responses) {
          // Iterate through each question in the response
          for (const questionResponse of response.questions) {
              // If the question's answer is correct, increment totalCorrect
              if (questionResponse.isCorrect) {
                  totalCorrect++;
              } else {
                  // If the question's answer is incorrect, increment totalIncorrect
                  totalIncorrect++;
              }
          }
      }

      res.status(200).json({ totalResponses, totalCorrect, totalIncorrect });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// {
//   "totalResponses": 2,
//   "totalCorrect": 1,
//   "totalIncorrect": 5
// }
// Route to get poll response statistics based on quiz ID
router.get('/poll/response/stats/:quizId', async (req, res) => {
  const quizId = req.params.quizId;

  try {
    const responseStats = await Response.aggregate([
      { $match: { quizId: quizId } }, // Match based on quizId only
      { $unwind: "$questions" },
      { $group: { _id: "$questions.selectedOption", count: { $sum: 1 } } }
    ]);

    const stats = {
      option1: 0,
      option2: 0,
      option3: 0,
      option4: 0
    };

    responseStats.forEach(stat => {
      switch (stat._id) {
        case 1:
          stats.option1 = stat.count;
          break;
        case 2:
          stats.option2 = stat.count;
          break;
        case 3:
          stats.option3 = stat.count;
          break;
        case 4:
          stats.option4 = stat.count;
          break;
        default:
          break;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// {
//   "option1": 15,
//   "option2": 10,
//   "option3": 8,
//   "option4": 12
// }


module.exports = router;
