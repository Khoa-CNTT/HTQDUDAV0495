import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadQuiz } from '../services/api';
import { toast } from 'react-toastify';

const UploadQuiz = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    category: 'Other',
    pdf: null
  });
  const [fileName, setFileName] = useState('');
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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files[0]) {
        setFormData({
          ...formData,
          pdf: files[0]
        });
        setFileName(files[0].name);
      }
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pdf) {
      toast.error('Please select a PDF file');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if user is authenticated
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        toast.error('Please log in to upload a quiz');
        navigate('/login');
        return;
      }

      // Create FormData object for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('isPublic', formData.isPublic);
      data.append('pdfFile', formData.pdf);

      const response = await uploadQuiz(data);
      
      toast.success('Quiz created successfully!');
      navigate(`/quiz/${response.quiz._id}`);
    } catch (error) {
      console.error('Error uploading quiz:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Upload a Quiz</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter a title for your quiz"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe what this quiz is about"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <span className="ml-2 text-gray-700">Make this quiz public</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Public quizzes can be viewed and taken by anyone
            </p>
          </div>
          
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">
              Upload PDF
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="pdf-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a PDF file</span>
                    <input
                      id="pdf-upload"
                      name="pdf"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handleChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
                {fileName && (
                  <p className="text-sm text-indigo-600 font-medium mt-2">
                    Selected: {fileName}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              The PDF should contain quiz questions in the format "A. Option [correct]"
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadQuiz; 