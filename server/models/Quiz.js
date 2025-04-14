const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    options: [{
        text: {
            type: String,
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
        label: {
            type: String,
            required: true,
        }
    }],
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        enum: ['General Knowledge', 'Science', 'History', 'Geography', 'Mathematics', 'Literature', 'Sports', 'Entertainment', 'Technology', 'Other'],
        default: 'Other'
    },
    originalPdfName: {
        type: String,
    },
    pdfPath: {
        type: String,
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isPublic: {
        type: Boolean,
        default: false,
    }
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;