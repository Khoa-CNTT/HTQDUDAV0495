import React, { useState, useEffect } from 'react';
import { getSubmissionById } from '../services/api';
import { useParams } from 'react-router-dom';
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching result:', error);
        setError('Failed to load results. Please try again.');
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-5">{error}</div>;
  }

  if (!result) {
    return <div className="text-center mt-5">Result not found</div>;
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const isPassing = percentage >= 60;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Results</h1>
      
      <div className={`p-6 rounded-lg mb-8 text-center ${isPassing ? 'bg-green-100' : 'bg-red-100'}`}>
        <h2 className="text-xl font-semibold mb-2">
          Your Score: {result.score} / {result.totalQuestions}
        </h2>
        <div className="text-3xl font-bold mb-4">
          {percentage}%
        </div>
        <p className={isPassing ? 'text-green-700' : 'text-red-700'}>
          {isPassing ? 'Congratulations! You passed!' : 'Keep practicing! You can do better next time.'}
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Question Answers</h3>
        
        {result.answers.map((answer, index) => (
          <div 
            key={index}
            className={`p-4 mb-4 rounded-lg ${answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <div className="flex items-center">
              <div className={`mr-2 p-1 rounded-full ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  {answer.isCorrect ? (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <span className="text-sm font-medium">
                Question {index + 1}: {answer.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <a 
          href="/dashboard" 
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default QuizResults; 