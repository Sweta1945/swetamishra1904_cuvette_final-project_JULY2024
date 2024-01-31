const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  quizType: {
    type: String,
    enum: ['quiz', 'poll'],
    required: true,
  },
  // Conditional field for questions
  questions: {
    type: [
      {
        questionText: { type: String, required: true },
        options: {
          type: [
            {
              type: String,
              required: true,
              minlength: 1,
            },
          ],
          validate: {
            validator: function (value) {
              // Ensure the array length is between 2 and 4
              return value.length >= 2 && value.length <= 4;
            },
            message: 'Number of options should be between 2 and 4.',
          },
        },
      
      correctAnswer: { type: String, required: false },
      timer: {
        type: Number,
        enum: [5, 10, 0],
        default: 0,
      },
    }],
    select: false, // Exclude from the default selection
  },

  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
  impressions: { type: Number, default: 0 },
});



const QuizModel = mongoose.model('QuizModel', quizSchema);

module.exports = QuizModel;
