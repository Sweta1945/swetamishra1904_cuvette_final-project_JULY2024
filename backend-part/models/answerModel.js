const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizModel',
    required: true,
  },
  userAnswers: [
    {
      type: String,
      required: true,
    },
  ],
  
  feedback: [
    {
      question: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      correctAnswer: {
        type: String,
        required: true,
      },
    },
  ],
});

const AnswerModel = mongoose.model('AnswerModel', AnswerSchema);

module.exports = AnswerModel;
