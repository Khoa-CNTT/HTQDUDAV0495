import React, { useState, useEffect } from 'react';
import { getSubmissionById } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const QuizResults = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getSubmissionById(id);
        setResult(data);
      } catch (error) {
        console.error('Error fetching result:', error);
        setError(error.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <Link
              to="/dashboard"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Quay về Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="text-center mt-5">Không tìm thấy kết quả</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">{result.quizId?.title || 'Quiz Results'}</h1>

        <div className="flex items-center text-sm text-gray-600 mb-6">
          <span className="mr-4">Lần thử #{result.attemptNumber}</span>
          <span>{new Date(result.completedAt).toLocaleString()}</span>
        </div>

        <div className={`p-6 rounded-lg mb-8 ${result.percentageScore >= 60 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Điểm số của bạn: {result.correctAnswers} / {result.totalQuestions}
            </h2>
            <div className="text-3xl font-bold mb-2">
              {result.percentageScore.toFixed(1)}%
            </div>
            <p className={result.percentageScore >= 60 ? 'text-green-700' : 'text-red-700'}>
              {result.percentageScore >= 60 ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra!' : 'Cố gắng luyện tập thêm nhé!'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Chi tiết từng câu</h3>

          {result.answers.map((answer, index) => (
            <div
              key={index}
              className={`p-4 mb-4 rounded-lg ${answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
            >
              <div className="mb-3">
                <span className="font-medium text-gray-800">Câu {index + 1}:</span>
                <p className="mt-1">{answer.question}</p>
              </div>

              <div className="ml-4">
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Câu trả lời của bạn:</span>
                  <p className={`mt-1 ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.selectedOptionText || 'Chưa trả lời'}
                  </p>
                </div>

                {!answer.isCorrect && (
                  <div>
                    <span className="font-medium text-gray-700">Đáp án đúng:</span>
                    <p className="mt-1 text-green-600">{answer.correctAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <Link
            to="/dashboard"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Quay về Dashboard
          </Link>

          <Link
            to={`/take-quiz/${result.quizId._id}`}
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Thử lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;