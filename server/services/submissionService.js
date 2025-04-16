const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

const submissionService = {
  /**
   * Create a new submission
   */
  async createSubmission(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if user has already submitted this quiz
    const existingSubmission = await Submission.findOne({
      quizId: quizId,
      userId: userId
    });

    if (existingSubmission) {
      throw new Error('You have already submitted this quiz');
    }

    // Calculate score
    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.correctAnswer === userAnswer;
      if (isCorrect) score++;
      return {
        questionId: question._id,
        selectedAnswer: userAnswer,
        isCorrect,
      };
    });

    const percentageScore = (score / quiz.questions.length) * 100;
    const passed = percentageScore >= (quiz.passingScore || 60);

    // Create submission
    const submission = await Submission.create({
      quizId: quizId,
      userId: userId,
      answers: results,
      score: percentageScore,
      totalQuestions: quiz.questions.length,
      completed: true,
      timeSpent: 0
    });

    return {
      message: 'Quiz submitted successfully',
      submission
    };
  },

  /**
   * Get all submissions for a quiz
   */
  async getQuizSubmissions(quizId, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== userId) {
      throw new Error('Not authorized to view submissions');
    }

    const submissions = await Submission.find({ quizId: quizId })
      .populate('userId', 'username displayName')
      .sort({ createdAt: -1 });

    return submissions;
  },

  /**
   * Get user's submission history
   */
  async getUserSubmissions(userId) {
    const submissions = await Submission.find({ userId: userId })
      .populate('quizId', 'title description')
      .sort({ createdAt: -1 });

    return submissions;
  },

  /**
   * Get submission details
   */
  async getSubmissionDetails(submissionId, userId) {
    const submission = await Submission.findById(submissionId)
      .populate('quizId', 'title description questions')
      .populate('userId', 'username displayName');

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Check if user owns the submission or the quiz
    const quiz = await Quiz.findById(submission.quizId);
    if (submission.userId.toString() !== userId && 
        quiz && quiz.createdBy.toString() !== userId) {
      throw new Error('Not authorized to view this submission');
    }

    return submission;
  },

  /**
   * Delete a submission
   */
  async deleteSubmission(submissionId, userId) {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Check if user owns the submission
    if (submission.userId.toString() !== userId) {
      throw new Error('Not authorized to delete this submission');
    }

    await submission.deleteOne();

    return {
      message: 'Submission deleted successfully'
    };
  }
};

module.exports = submissionService; 