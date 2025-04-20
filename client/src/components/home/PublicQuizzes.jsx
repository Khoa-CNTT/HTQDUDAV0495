import { useState, useEffect } from "react";

const mockQuizzes = [
  {
    id: 1,
    title: "Math Challenge",
    description: "Test your math skills with this quiz.",
    date: "2024-04-01",
  },
  {
    id: 2,
    title: "General Knowledge",
    description: "A quiz on general knowledge topics.",
    date: "2024-03-25",
  },
  {
    id: 3,
    title: "Science Quiz",
    description: "How well do you know the world of science?",
    date: "2024-03-10",
  },
];

export default function PublicQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    // Simulate fetching quizzes from an API
    setQuizzes(mockQuizzes);
  }, []);

  return (
    <div className="">
      <div className="px-6 py-12 mx-auto max-w-7xl ">
        <h2 className="text-3xl font-bold text-gray-900">Public Quizzes</h2>
        <div className="grid gap-8 mt-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {quiz.title}
              </h3>
              <p className="mt-2 text-gray-600">{quiz.description}</p>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <span>{quiz.date}</span>
                <a
                  href={`/quiz/${quiz.id}`}
                  className="font-semibold text-primary hover:text-primary-dark"
                >
                  Take Quiz
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
