const quizService = require('../services/quizService');
const submissionService = require('../services/submissionService');

//  POST /api/quizzes ( Tạo quiz mới )
const createQuiz = async (req, res) => {
    try {
        const result = await quizService.createQuiz(req.user._id, req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating quiz:', error);
        if (error.message.includes('Please provide') ||
            error.message.includes('Each question must have') ||
            error.message.includes('Each option must have')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while creating quiz.' });
    }
};

//  GET /api/quizzes/public ( Lấy tất cả các quiz công khai )
const getPublicQuizzes = async (req, res) => {
    try {
        const quizzes = await quizService.getPublicQuizzes();
        res.json(quizzes);
    } catch (error) {
        console.error('Error getting public quizzes:', error);
        res.status(500).json({ message: 'Error getting public quiz list' });
    }
};

const quizController = {
    createQuiz,
    getPublicQuizzes
};

module.exports = quizController; 