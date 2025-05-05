const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Tất cả route này cần bảo vệ và kiểm tra quyền admin
router.use(protect, isAdmin);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/quizzes', adminController.getAllQuizzes);
router.delete('/quizzes/:id', adminController.deleteQuiz);

module.exports = router;