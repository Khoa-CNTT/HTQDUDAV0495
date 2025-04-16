const submissionService = require('../services/submissionService');

/**
 * Create a new submission
 * @route POST /api/submissions/:quizId
 * @access Private
 */
const createSubmission = async (req, res) => {
  try {
    const result = await submissionService.createSubmission(
      req.params.quizId,
      req.user._id,
      req.body.answers
    );
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get all submissions for a quiz
 * @route GET /api/submissions/quiz/:quizId
 * @access Private
 */
const getQuizSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getQuizSubmissions(
      req.params.quizId,
      req.user._id
    );
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error getting quiz submissions:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get user's submission history
 * @route GET /api/submissions/user
 * @access Private
 */
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getUserSubmissions(req.user._id);
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error getting user submissions:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get submission details
 * @route GET /api/submissions/:id
 * @access Private
 */
const getSubmissionDetails = async (req, res) => {
  try {
    const submission = await submissionService.getSubmissionDetails(
      req.params.id,
      req.user._id
    );
    res.status(200).json(submission);
  } catch (error) {
    console.error('Error getting submission details:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a submission
 * @route DELETE /api/submissions/:id
 * @access Private
 */
const deleteSubmission = async (req, res) => {
  try {
    const result = await submissionService.deleteSubmission(
      req.params.id,
      req.user._id
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSubmission,
  getQuizSubmissions,
  getUserSubmissions,
  getSubmissionDetails,
  deleteSubmission
}; 