const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const crypto = require('crypto');

const submissionService = {
  /**
   * Create a new submission
   */
  async createSubmission(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId).populate('questions.options');
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Generate a unique submission ID
    const submissionId = crypto.randomBytes(16).toString('hex');

    // Get attempt number
    const attemptCount = await Submission.countDocuments({
      quizId,
      userId
    });

    // Calculate score and validate answers
    let correctAnswers = 0;
    const results = answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      const correctOption = question.options.find(opt => opt.isCorrect);
      if (!correctOption) {
        throw new Error(`No correct answer found for question ${answer.questionId}`);
      }

      const isCorrect = answer.selectedAnswer && correctOption._id.toString() === answer.selectedAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question._id,
        question: question.content,
        selectedAnswer: answer.selectedAnswer,
        selectedOptionText: answer.selectedOptionText,
        correctAnswer: correctOption.label,
        isCorrect
      };
    });

    const percentageScore = (correctAnswers / quiz.questions.length) * 100;

    // Create new submission
    const submission = await Submission.create({
      submissionId,
      quizId,
      userId,
      answers: results,
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      percentageScore,
      completed: true,
      attemptNumber: attemptCount + 1,
      completedAt: new Date()
    });

    return {
      message: 'Quiz submitted successfully',
      submission: {
        ...submission.toObject(),
        submissionInfo: {
          score: `${correctAnswers}/${quiz.questions.length} (${percentageScore.toFixed(1)}%)`,
          completedAt: submission.completedAt.toLocaleString(),
          attemptNumber: submission.attemptNumber
        }
      }
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
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    if (submission.userId.toString() !== userId &&
      quiz.createdBy.toString() !== userId) {
      throw new Error('Not authorized to view this submission');
    }

    // Add question text and correct answer text to each answer
    const detailedAnswers = submission.answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId.toString());
      if (!question) return answer;

      return {
        ...answer.toObject(),
        question: question.text,
        correctAnswer: question.options.find(opt => opt.isCorrect)?.text
      };
    });

    const result = submission.toObject();
    result.answers = detailedAnswers;
    return result;
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