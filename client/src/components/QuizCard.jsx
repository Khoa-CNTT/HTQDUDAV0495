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
    <div className="relative group">
      <Link
        to={`/quiz/${quiz._id}`}
        className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
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
          <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded cursor-pointer group-hover:bg-indigo-100 transition-colors">
            Xem chi tiết
          </span>
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(quiz._id); }}
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 z-10"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default QuizCard; 