const User = require('../models/User');
const Quiz = require('../models/Quiz');

// Lấy danh sách tất cả user
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting users' });
    }
};

// Xóa user theo id
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// Lấy tất cả quiz
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Error getting quizzes' });
    }
};

// Xóa quiz theo id
const deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quiz' });
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getAllQuizzes,
    deleteQuiz,
};