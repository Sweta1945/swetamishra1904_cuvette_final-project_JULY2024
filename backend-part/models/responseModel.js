const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
        
    },
    selectedOption: {
        type: Number,
       
    },
    isCorrect: {
        type: Boolean,
        
    }
});

const responseSchema = new mongoose.Schema({
  
    quizId: {
        type: String,
        required: true
    },
    quizTitle: {
        type: String,
        required: true
    },
    
    questions: [questionSchema], // Array of questions
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
