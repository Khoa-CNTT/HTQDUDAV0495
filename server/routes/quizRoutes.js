const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const quizController = require('../controllers/quizController');

router.post('/', protect, quizController.createQuiz);
router.get('/public', quizController.getPublicQuizzes);

module.exports = router;