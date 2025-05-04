const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const quizController = require('../controllers/quizController');

router.post('/', protect, quizController.createQuiz);
router.get('/public', quizController.getPublicQuizzes);
router.get('/', protect, quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);
router.delete('/:id', protect, quizController.deleteQuiz);
router.post('/:id/submit', protect, quizController.submitQuizAnswers);

module.exports = router;