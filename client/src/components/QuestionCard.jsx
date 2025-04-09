const QuestionCard = ({ 
  question, 
  questionIndex, 
  selectedOption, 
  onSelectOption, 
  showResults = false,
  userAnswer = null
}) => {
  // Add error handling for missing question or options
  if (!question) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-red-500">Error: Question data is missing</p>
      </div>
    );
  }

  // Ensure options array exists
  const options = question.options || [];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Question {questionIndex + 1}
        </h3>
        <p className="text-gray-700 mt-2">{question.text || 'No question text available'}</p>
      </div>
      
      <div className="space-y-3">
        {options.length > 0 ? (
          options.map((option, index) => {
            // Determine styling based on whether we're showing results
            let optionClass = "border rounded-lg p-3 cursor-pointer flex items-center";
            
            if (showResults) {
              if (option.isCorrect) {
                optionClass += " bg-green-100 border-green-300";
              } else if (userAnswer && userAnswer.selectedOptionIndex === index && !option.isCorrect) {
                optionClass += " bg-red-100 border-red-300";
              } else {
                optionClass += " border-gray-200";
              }
            } else {
              optionClass += selectedOption === index 
                ? " bg-indigo-100 border-indigo-300" 
                : " hover:bg-gray-50 border-gray-200";
            }
            
            return (
              <div 
                key={index}
                className={optionClass}
                onClick={() => !showResults && onSelectOption(index)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{option.label || String.fromCharCode(65 + index)}.</span>
                    <span>{option.text || `Option ${index + 1}`}</span>
                  </div>
                </div>
                
                {selectedOption === index && !showResults && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {showResults && option.isCorrect && (
                  <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="border rounded-lg p-3 text-gray-500">
            No options available for this question
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard; 