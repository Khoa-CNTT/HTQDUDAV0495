const Quiz = require("../models/Quiz");
const User = require("../models/User");
const Submission = require("../models/Submission");

const quizService = {
  async createQuiz(userId, quizData) {
    try {
      if (
        !quizData.title ||
        !quizData.questions ||
        !Array.isArray(quizData.questions) ||
        quizData.questions.length === 0
      ) {
        throw new Error("Please type a valid title and list of questions.");
      }

      for (const question of quizData.questions) {
        if (
          !question.text ||
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length === 0
        ) {
          throw new Error(
            "Question must have content and at least one option."
          );
        }

        for (const option of question.options) {
          if (
            !option.text ||
            typeof option.isCorrect !== "boolean" ||
            !option.label
          ) {
            throw new Error(
              "Question must have content, label and correct/incorrect status."
            );
          }
        }
      }

      const quiz = await Quiz.create({
        title: quizData.title,
        description: quizData.description || "",
        category: quizData.category || "Other",
        questions: quizData.questions,
        createdBy: userId,
        isPublic: quizData.isPublic || false,
      });

      return {
        message: "Quiz created successfully",
        quiz,
      };
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  },

  async getPublicQuizzes() {
    try {
      const quizzes = await Quiz.find({ isPublic: true })
        .populate("createdBy", "username displayName")
        .sort({ createdAt: -1 });
      return quizzes;
    } catch (error) {
      console.error("Error in getPublicQuizzes:", error);
      throw error;
    }
  },
  async createQuizFromPDF(file, userId, quizData = {}) {
    try {
      // Parse PDF and extract questions
      const questions = await parsePdfForQuestions(file.path);

      // Create quiz
      const quiz = await Quiz.create({
        title: quizData.title || file.originalname.replace(".pdf", ""),
        description: quizData.description || "Quiz created from PDF",
        category: quizData.category || "Other",
        questions,
        createdBy: userId,
        originalPdfName: file.originalname,
        pdfPath: file.path,
        isPublic: quizData.isPublic === "true",
      });

      return {
        message: "Quiz created successfully",
        quiz,
      };
    } catch (error) {
      console.error("Error creating quiz from PDF:", error);
      throw new Error("Failed to create quiz from PDF");
    }
  },

  /**
   * Get all quizzes with optional filters
   */
  async getAllQuizzes(filters = {}) {
    const query = {};

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.createdBy) query.createdBy = filters.createdBy;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const quizzes = await Quiz.find(query)
      .populate("createdBy", "username displayName")
      .sort({ createdAt: -1 });

    return quizzes;
  },

  /**
   * Get a single quiz by ID
   */
  async getQuizById(quizId) {
    const quiz = await Quiz.findById(quizId).populate(
      "createdBy",
      "username displayName"
    );

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return quiz;
  },

  /**
   * Update a quiz
   */
  async updateQuiz(quizId, userId, updateData) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== userId) {
      throw new Error("Not authorized to update this quiz");
    }

    // Update fields
    if (updateData.title) quiz.title = updateData.title;
    if (updateData.description) quiz.description = updateData.description;
    if (updateData.questions) quiz.questions = updateData.questions;
    if (updateData.status) quiz.status = updateData.status;
    if (updateData.timeLimit) quiz.timeLimit = updateData.timeLimit;
    if (updateData.passingScore) quiz.passingScore = updateData.passingScore;

    await quiz.save();

    return {
      message: "Quiz updated successfully",
      quiz,
    };
  },

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId, userId) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== userId) {
      throw new Error("Not authorized to delete this quiz");
    }

    await quiz.deleteOne();

    return {
      message: "Quiz deleted successfully",
    };
  },

  /**
   * Submit quiz answers
   */
  async submitQuizAnswers(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate score
    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.correctAnswer === userAnswer;
      if (isCorrect) score++;
      return {
        questionId: question._id,
        userAnswer,
        isCorrect,
        correctAnswer: question.correctAnswer,
      };
    });

    const percentageScore = (score / quiz.questions.length) * 100;
    const passed = percentageScore >= (quiz.passingScore || 60);

    // Create submission record
    const submission = await Submission.create({
      quizId: quizId,
      userId: userId,
      answers: results,
      score: percentageScore,
      totalQuestions: quiz.questions.length,
      completed: true,
    });

    return {
      message: "Quiz submitted successfully",
      submission,
    };
  },

  /**
   * Get quiz submissions
   */
  async getQuizSubmissions(quizId, userId) {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== userId) {
      throw new Error("Not authorized to view submissions");
    }

    const submissions = await Submission.find({ quizId: quizId })
      .populate("userId", "username displayName")
      .sort({ createdAt: -1 });

    return submissions;
  },
};

module.exports = quizService;
