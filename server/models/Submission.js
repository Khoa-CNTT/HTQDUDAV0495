const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      selectedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }
  ],
  timeSpent: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for faster queries
submissionSchema.index({ userId: 1 });
submissionSchema.index({ quizId: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ userId: 1, quizId: 1 });

module.exports = mongoose.model('Submission', submissionSchema); 