const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Submission = require('../models/Submission');

const quizService = {
    async createQuiz(userId, quizData) {
        try {
            if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
                throw new Error('Please type a valid title and list of questions.');
            }

            for (const question of quizData.questions) {
                if (!question.text || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
                    throw new Error('Question must have content and at least one option.');
                }

                for (const option of question.options) {
                    if (!option.text || typeof option.isCorrect !== 'boolean' || !option.label) {
                        throw new Error('Question must have content, label and correct/incorrect status.');
                    }
                }
            }

            const quiz = await Quiz.create({
                title: quizData.title,
                description: quizData.description || '',
                category: quizData.category || 'Other',
                questions: quizData.questions,
                createdBy: userId,
                isPublic: quizData.isPublic || false
            });

            return {
                message: 'Quiz created successfully',
                quiz
            };
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw error;
        }
    },

    async getPublicQuizzes() {
        try {
            const quizzes = await Quiz.find({ isPublic: true })
                .populate('createdBy', 'username displayName')
                .sort({ createdAt: -1 });
            return quizzes;
        } catch (error) {
            console.error('Error in getPublicQuizzes:', error);
            throw error;
        }
    },
};

module.exports = quizService;