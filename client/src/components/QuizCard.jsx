import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const QuizCard = ({ quiz, onDelete, showCreator = false }) => {
  // Helper function to get the creator's name
  const getCreatorName = () => {
    if (!quiz.createdBy) return 'Unknown';
    
    if (typeof quiz.createdBy === 'object') {
      return quiz.createdBy.displayName || quiz.createdBy.username || 'Unknown';
    }
    
    // If createdBy is just a string (e.g., ID)
    return quiz.createdBy;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
        {quiz.isPublic && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            Public
          </span>
        )}
      </div>
      
      <p className="text-gray-600 mb-4">
        {quiz.description || 'No description provided'}
      </p>
      
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <span className="mr-4">{quiz.questionsCount || (quiz.questions && quiz.questions.length) || 0} questions</span>
        {quiz.category && (
          <span className="mr-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {quiz.category}
          </span>
        )}
        <span>
          Created {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
        </span>
      </div>
      
      {showCreator && quiz.createdBy && (
        <div className="text-sm text-gray-500 mb-4">
          Created by: {getCreatorName()}
        </div>
      )}
      
      <div className="flex space-x-3">
        <Link
          to={`/quiz/${quiz._id}`}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          View Details
        </Link>
        
        {onDelete && (
          <button
            onClick={() => onDelete(quiz._id)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard; 