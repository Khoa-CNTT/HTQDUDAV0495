import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateAIQuiz = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    topic: '',
    description: '',
    category: 'Other',
    numQuestions: 10,
    isPublic: false,
    language: 'english'
  });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInput = (e) => {
    const value = parseInt(e.target.value);
    // Limit to range 5-30
    const numQuestions = Math.min(Math.max(5, value || 5), 30);
    setQuizData(prev => ({ ...prev, numQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizData.topic) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      setIsLoading(true);
      const toastId = toast.loading('Generating quiz with AI...');
      
      // Call the AI endpoint
      const response = await fetch('/api/quizzes/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`
        },
        body: JSON.stringify(quizData)
      });
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      // Safely parse JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('Invalid server response');
      }
      
      toast.dismiss(toastId);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create quiz');
      }
      
      toast.success('Quiz created successfully!');
      navigate(`/quiz/${data.data._id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.message || 'Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Create Quiz with AI</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">How it works:</h2>
          <p className="text-gray-700 mb-2">
            Enter a topic and our AI will automatically create quiz questions for you! 
            You can specify how many questions (5-30) you want, choose a category, select a language (English or Vietnamese), and add a description to guide the question generation.
          </p>
          <p className="text-gray-700">
            <strong>Pro tip:</strong> Adding a detailed description helps the AI generate more focused and relevant questions. For example, instead of just "Solar System", you could specify "Focus on planetary moons and their unique features."
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Quiz Title</label>
            <input
              type="text"
              name="title"
              value={quizData.title}
              onChange={handleInputChange}
              placeholder="Leave blank to auto-generate from topic"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Topic (required)</label>
            <input
              type="text"
              name="topic"
              value={quizData.topic}
              onChange={handleInputChange}
              placeholder="e.g., Solar System, World War II, Machine Learning"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific for better results: "Ancient Egyptian Mythology" instead of just "History"
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={quizData.description}
              onChange={handleInputChange}
              placeholder="Add specific details or context to guide the AI in generating better questions"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
            <p className="text-sm text-gray-500 mt-1">
              The description will be used to help the AI understand the specific focus and context of your quiz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                name="category"
                value={quizData.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Number of Questions (5-30)</label>
              <input
                type="number"
                name="numQuestions"
                value={quizData.numQuestions}
                onChange={handleNumberInput}
                min="5"
                max="30"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Language</label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="language"
                  value="english"
                  checked={quizData.language === 'english'}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2">English</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="language"
                  value="vietnamese"
                  checked={quizData.language === 'vietnamese'}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2">Vietnamese</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={quizData.isPublic}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="ml-2 block text-gray-700">
              Make this quiz public
            </label>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !quizData.topic}
              className={`px-6 py-3 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors flex items-center space-x-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate Quiz</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAIQuiz; 