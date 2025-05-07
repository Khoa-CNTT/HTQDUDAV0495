import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaFire, FaStar } from "react-icons/fa";

const mockQuizzes = [
  {
    id: 1,
    title: "Advanced Mathematics Challenge",
    description: "Test your mathematical prowess with this comprehensive quiz covering calculus, algebra, and geometry.",
    date: "2024-04-01",
    difficulty: "Hard",
    category: "Mathematics",
    participants: 1234,
    rating: 4.8,
    icon: <FaTrophy className="w-5 h-5" />
  },
  {
    id: 2,
    title: "World History Explorer",
    description: "Journey through time with questions about ancient civilizations, world wars, and modern history.",
    date: "2024-03-25",
    difficulty: "Medium",
    category: "History",
    participants: 856,
    rating: 4.5,
    icon: <FaFire className="w-5 h-5" />
  },
  {
    id: 3,
    title: "Science & Technology Quiz",
    description: "Explore the fascinating world of science and technology with questions about physics, chemistry, and modern innovations.",
    date: "2024-03-10",
    difficulty: "Medium",
    category: "Science",
    participants: 1023,
    rating: 4.7,
    icon: <FaStar className="w-5 h-5" />
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function PublicQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    // Simulate fetching quizzes from an API
    setQuizzes(mockQuizzes);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative"
    >
      <div className="px-6 py-12 mx-auto max-w-7xl">
        <motion.div
          variants={itemVariants}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
            Featured Quizzes
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover and challenge yourself with our most popular quizzes
          </p>
        </motion.div>

        <div className="grid gap-8 mt-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative p-6 transition-all duration-300 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl"
            >
              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <span className="flex items-center px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full">
                  {quiz.icon}
                  <span className="ml-2">{quiz.category}</span>
                </span>
              </div>

              {/* Content */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                  {quiz.title}
                </h3>
                <p className="mt-2 text-gray-600 line-clamp-2">
                  {quiz.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-indigo-600">{quiz.rating}</span>
                    <span>rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-indigo-600">{quiz.participants}</span>
                    <span>participants</span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    quiz.difficulty === 'Hard' 
                      ? 'text-red-600 bg-red-50' 
                      : quiz.difficulty === 'Medium'
                      ? 'text-yellow-600 bg-yellow-50'
                      : 'text-green-600 bg-green-50'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <motion.a
                    href={`/quiz/${quiz.id}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Take Quiz
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <motion.a
            href="/quizzes"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl"
          >
            View All Quizzes
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}
