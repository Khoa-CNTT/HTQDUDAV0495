import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createQuiz } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const CreateQuiz = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Other',
        isPublic: false,
        questions: [
            {
                text: '',
                options: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ]
            }
        ]
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = [
        'General Knowledge',
        'Science',
        'History',
        'Geography',
        'Mathematics',
        'Literature',
        'Sports',
        'Entertainment',
        'Technology',
        'Other'
    ];

    const validateForm = () => {
        const newErrors = {};

        // Validate title
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        }

        // Validate description
        if (formData.description.length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }

        // Validate questions
        formData.questions.forEach((question, qIndex) => {
            if (!question.text.trim()) {
                newErrors[`question_${qIndex}`] = 'Question is required';
            }

            // Validate options
            let hasCorrectAnswer = false;
            question.options.forEach((option, oIndex) => {
                if (!option.text.trim()) {
                    newErrors[`option_${qIndex}_${oIndex}`] = 'Option is required';
                }
                if (option.isCorrect) hasCorrectAnswer = true;
            });

            if (!hasCorrectAnswer) {
                newErrors[`question_${qIndex}_correct`] = 'Each question must have at least one correct answer';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleQuestionChange = (index, field, value) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = {
                ...newQuestions[index],
                [field]: value
            };
            return {
                ...prev,
                questions: newQuestions
            };
        });
        // Clear error when user starts typing
        if (errors[`question_${index}`]) {
            setErrors(prev => ({ ...prev, [`question_${index}`]: null }));
        }
    };

    const handleOptionChange = (questionIndex, optionIndex, field, value) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[questionIndex].options[optionIndex] = {
                ...newQuestions[questionIndex].options[optionIndex],
                [field]: value
            };
            return {
                ...prev,
                questions: newQuestions
            };
        });
        // Clear error when user starts typing
        if (errors[`option_${questionIndex}_${optionIndex}`]) {
            setErrors(prev => ({ ...prev, [`option_${questionIndex}_${optionIndex}`]: null }));
        }
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    text: '',
                    options: [
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false }
                    ]
                }
            ]
        }));
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please check all required fields');
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
                questions: formData.questions.map(question => ({
                    content: question.text,
                    options: question.options.map(option => ({
                        label: option.text,
                        isCorrect: option.isCorrect
                    }))
                }))
            };

            const response = await createQuiz(formattedData);
            toast.success('Quiz created successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error creating quiz:', error);
            // Hiển thị thông báo lỗi chi tiết từ server
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'An error occurred while creating the quiz. Please try again later.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
            >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-10">
                        <div className="text-center mb-10">
                            <motion.h1 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl font-bold text-gray-800 mb-3"
                            >
                                Create New Quiz
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-600 text-lg"
                            >
                                Manually create a quiz by adding questions and answers
                            </motion.p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-8">
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl"
                                >
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                                Quiz Title
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                                                    errors.title 
                                                        ? 'border-red-500 focus:ring-red-200' 
                                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                }`}
                                                placeholder="Enter your quiz title"
                                            />
                                            {errors.title && (
                                                <motion.p 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-1 text-sm text-red-600 flex items-center"
                                                >
                                                    <FiX className="mr-1" /> {errors.title}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="3"
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                                                    errors.description 
                                                        ? 'border-red-500 focus:ring-red-200' 
                                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                }`}
                                                placeholder="Short description about your quiz"
                                            ></textarea>
                                            {errors.description && (
                                                <motion.p 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-1 text-sm text-red-600 flex items-center"
                                                >
                                                    <FiX className="mr-1" /> {errors.description}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Category
                                                </label>
                                                <select
                                                    id="category"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                                >
                                                    {categories.map((category) => (
                                                        <option key={category} value={category}>
                                                            {category}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border-2 border-gray-100">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isPublic"
                                                        checked={formData.isPublic}
                                                        onChange={handleChange}
                                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                                                    />
                                                    <span className="ml-3 text-gray-700 font-medium">Make quiz public</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={addQuestion}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                                        >
                                            <FiPlus /> <span>Add question</span>
                                        </motion.button>
                                    </div>

                                    <div className="space-y-6">
                                        {formData.questions.map((question, questionIndex) => (
                                            <motion.div
                                                key={questionIndex}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: questionIndex * 0.1 }}
                                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                                                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm mr-3">
                                                            Question {questionIndex + 1}
                                                        </span>
                                                    </h3>
                                                    {formData.questions.length > 1 && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            type="button"
                                                            onClick={() => removeQuestion(questionIndex)}
                                                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <FiTrash2 />
                                                        </motion.button>
                                                    )}
                                                </div>

                                                <div className="mb-6">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Question Content
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={question.text}
                                                        onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                                                            errors[`question_${questionIndex}`] 
                                                                ? 'border-red-500 focus:ring-red-200' 
                                                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                        }`}
                                                        placeholder="Enter question"
                                                    />
                                                    {errors[`question_${questionIndex}`] && (
                                                        <motion.p 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="mt-1 text-sm text-red-600 flex items-center"
                                                        >
                                                            <FiX className="mr-1" /> {errors[`question_${questionIndex}`]}
                                                        </motion.p>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Options
                                                    </label>
                                                    {question.options.map((option, optionIndex) => (
                                                        <motion.div
                                                            key={optionIndex}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: optionIndex * 0.1 }}
                                                            className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${questionIndex}`}
                                                                checked={option.isCorrect}
                                                                onChange={() => {
                                                                    const newOptions = question.options.map((o, i) => ({
                                                                        ...o,
                                                                        isCorrect: i === optionIndex
                                                                    }));
                                                                    handleQuestionChange(questionIndex, 'options', newOptions);
                                                                }}
                                                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                                                                className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all duration-200 ${
                                                                    errors[`option_${questionIndex}_${optionIndex}`] 
                                                                        ? 'border-red-500 focus:ring-red-200' 
                                                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                                }`}
                                                                placeholder={`Option ${optionIndex + 1}`}
                                                            />
                                                            {option.isCorrect && (
                                                                <span className="text-green-600 flex items-center">
                                                                    <FiCheck className="mr-1" /> Correct
                                                                </span>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                    {errors[`question_${questionIndex}_correct`] && (
                                                        <motion.p 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="mt-1 text-sm text-red-600 flex items-center"
                                                        >
                                                            <FiX className="mr-1" /> {errors[`question_${questionIndex}_correct`]}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex space-x-4 mt-8">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? 'Creating...' : 'Create Quiz'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200 shadow-lg"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateQuiz; 