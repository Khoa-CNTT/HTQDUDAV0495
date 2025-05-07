import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createQuiz } from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiCheck, FiX } from "react-icons/fi";

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    isPublic: false,
    questions: [
      {
        text: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "General Knowledge",
    "Science",
    "History",
    "Geography",
    "Mathematics",
    "Literature",
    "Sports",
    "Entertainment",
    "Technology",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    // Validate description
    if (formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    // Validate questions
    formData.questions.forEach((question, qIndex) => {
      if (!question.text.trim()) {
        newErrors[`question_${qIndex}`] = "Question is required";
      }

      // Validate options
      let hasCorrectAnswer = false;
      question.options.forEach((option, oIndex) => {
        if (!option.text.trim()) {
          newErrors[`option_${qIndex}_${oIndex}`] = "Option is required";
        }
        if (option.isCorrect) hasCorrectAnswer = true;
      });

      if (!hasCorrectAnswer) {
        newErrors[`question_${qIndex}_correct`] =
          "Each question must have at least one correct answer";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
    // Clear error when user starts typing
    if (errors[`question_${index}`]) {
      setErrors((prev) => ({ ...prev, [`question_${index}`]: null }));
    }
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options[optionIndex] = {
        ...newQuestions[questionIndex].options[optionIndex],
        [field]: value,
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
    // Clear error when user starts typing
    if (errors[`option_${questionIndex}_${optionIndex}`]) {
      setErrors((prev) => ({
        ...prev,
        [`option_${questionIndex}_${optionIndex}`]: null,
      }));
    }
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please check all required fields");
      return;
    }

    setLoading(true);
    try {
      // Format data to match server requirements
      const formattedData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isPublic: formData.isPublic,
        questions: formData.questions.map((question) => ({
          content: question.text,
          options: question.options.map((option) => ({
            label: option.text,
            isCorrect: option.isCorrect,
          })),
        })),
      };

      const response = await createQuiz(formattedData);
      toast.success("Quiz created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating quiz:", error);
      // Hiển thị thông báo lỗi chi tiết từ server
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An error occurred while creating the quiz. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Create New Quiz
                </h1>
                <p className="text-gray-600">
                  Create a quiz manually by adding questions and answers
                </p>
              </motion.div>

              <form onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mb-6"
                >
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${
                      errors.title
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                    }`}
                    placeholder="Enter a title for your quiz"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mb-6"
                >
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${
                      errors.description
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                    }`}
                    placeholder="Describe what this quiz is about"
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="mb-6"
                >
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-8"
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">
                      Make this quiz public
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">
                    Public quizzes can be viewed and taken by everyone
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="mb-8"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Questions
                    </h2>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Add Question</span>
                    </button>
                  </div>

                  {formData.questions.map((question, questionIndex) => (
                    <motion.div
                      key={questionIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.1 * questionIndex }}
                      className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          Question {questionIndex + 1}
                        </h3>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Delete</span>
                          </button>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Content
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(
                              questionIndex,
                              "text",
                              e.target.value
                            )
                          }
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${
                            errors[`question_${questionIndex}`]
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                          }`}
                          placeholder="Enter your question"
                        />
                        {errors[`question_${questionIndex}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`question_${questionIndex}`]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              checked={option.isCorrect}
                              onChange={() => {
                                const newOptions = question.options.map(
                                  (o, i) => ({
                                    ...o,
                                    isCorrect: i === optionIndex,
                                  })
                                );
                                handleQuestionChange(
                                  questionIndex,
                                  "options",
                                  newOptions
                                );
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) =>
                                handleOptionChange(
                                  questionIndex,
                                  optionIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${
                                errors[`option_${questionIndex}_${optionIndex}`]
                                  ? "border-red-500 focus:ring-red-200"
                                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                              }`}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                        {errors[`question_${questionIndex}_correct`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`question_${questionIndex}_correct`]}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex space-x-4"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      "Create Quiz"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 py-4 px-6 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-300 shadow hover:shadow-md"
                  >
                    Cancel
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateQuiz;
