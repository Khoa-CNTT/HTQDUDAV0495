import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createQuiz } from '../services/api';
import toast from 'react-hot-toast';

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
            newErrors.title = 'Tiêu đề không được để trống';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
        }

        // Validate description
        if (formData.description.length > 500) {
            newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
        }

        // Validate questions
        formData.questions.forEach((question, qIndex) => {
            if (!question.text.trim()) {
                newErrors[`question_${qIndex}`] = 'Câu hỏi không được để trống';
            }

            // Validate options
            let hasCorrectAnswer = false;
            question.options.forEach((option, oIndex) => {
                if (!option.text.trim()) {
                    newErrors[`option_${qIndex}_${oIndex}`] = 'Lựa chọn không được để trống';
                }
                if (option.isCorrect) hasCorrectAnswer = true;
            });

            if (!hasCorrectAnswer) {
                newErrors[`question_${qIndex}_correct`] = 'Mỗi câu hỏi phải có ít nhất một đáp án đúng';
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
            toast.error('Vui lòng kiểm tra lại các trường thông tin');
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
            toast.success('Tạo quiz thành công!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error creating quiz:', error);
            // Hiển thị thông báo lỗi chi tiết từ server
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra khi tạo quiz. Vui lòng thử lại sau.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo Quiz Mới</h1>
                            <p className="text-gray-600">Tạo quiz thủ công bằng cách thêm câu hỏi và đáp án</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề Quiz
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                        }`}
                                    placeholder="Nhập tiêu đề cho quiz của bạn"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div className="mb-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả (Tùy chọn)
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                        }`}
                                    placeholder="Mô tả ngắn gọn về quiz của bạn"
                                ></textarea>
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div className="mb-6">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Danh mục
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
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-gray-700">Công khai quiz này</span>
                                </label>
                                <p className="text-sm text-gray-500 mt-1 ml-6">
                                    Quiz công khai có thể được xem và làm bởi mọi người
                                </p>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Câu hỏi</h2>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                    >
                                        Thêm câu hỏi
                                    </button>
                                </div>

                                {formData.questions.map((question, questionIndex) => (
                                    <div key={questionIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-medium text-gray-800">Câu hỏi {questionIndex + 1}</h3>
                                            {formData.questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(questionIndex)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Xóa
                                                </button>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nội dung câu hỏi
                                            </label>
                                            <input
                                                type="text"
                                                value={question.text}
                                                onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${errors[`question_${questionIndex}`] ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                    }`}
                                                placeholder="Nhập câu hỏi"
                                            />
                                            {errors[`question_${questionIndex}`] && (
                                                <p className="mt-1 text-sm text-red-600">{errors[`question_${questionIndex}`]}</p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lựa chọn
                                            </label>
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center space-x-3">
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
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option.text}
                                                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                                                        className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 transition-colors ${errors[`option_${questionIndex}_${optionIndex}`] ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                            }`}
                                                        placeholder={`Lựa chọn ${optionIndex + 1}`}
                                                    />
                                                </div>
                                            ))}
                                            {errors[`question_${questionIndex}_correct`] && (
                                                <p className="mt-1 text-sm text-red-600">{errors[`question_${questionIndex}_correct`]}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo Quiz'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateQuiz; 