import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaEdit, FaTrash } from 'react-icons/fa';

const QuizCard = ({ quiz, onDelete, showCreator = false, isCreator = true }) => {
  const navigate = useNavigate();

  // Helper function to get the creator's name
  const getCreatorName = () => {
    if (!quiz.createdBy) return 'Unknown';

    if (typeof quiz.createdBy === 'object') {
      return quiz.createdBy.displayName || quiz.createdBy.username || 'Unknown';
    }

    // If createdBy is just a string (e.g., ID)
    return quiz.createdBy;
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-quiz/${quiz._id}`);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(quiz._id);
  };

  return (
    <div className="relative quiz-card bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40 hover:shadow-[0_0_40px_10px_rgba(236,72,153,0.7)] transition-all duration-500 group">
      <div className="p-6 h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
            {quiz.title}
          </h3>
          {quiz.isPublic ? (
            <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full font-orbitron">
              Public
            </span>
          ) : (
            <span className="px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full font-orbitron">
              Private
            </span>
          )}
        </div>
        <p className="text-pink-200 mb-4 font-orbitron line-clamp-2">
          {quiz.description || 'No description provided'}
        </p>
        <div className="text-pink-200 mb-4 font-orbitron">
          {quiz.questions ? `${quiz.questions.length} questions` : "Loading questions..."}
        </div>
        {showCreator && quiz.createdBy && (
          <div className="text-sm text-pink-200 mb-4 font-orbitron">
            Created by: {getCreatorName()}
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          {/* Edit and Delete buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleEditClick}
              className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-yellow-400/10"
              title="Edit Quiz"
            >
              <FaEdit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-pink-400 hover:text-pink-300 transition-colors rounded-full hover:bg-pink-400/10"
              title="Delete Quiz"
            >
              <FaTrash className="w-5 h-5" />
            </button>
          </div>

          {/* Take Quiz button */}
          <Link
            to={`/quiz/${quiz._id}`}
            className="px-6 py-2 text-center text-white transition-all duration-300 font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400"
          >
            Take Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;