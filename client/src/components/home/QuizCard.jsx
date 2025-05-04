import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const QuizCard = ({ quiz }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="overflow-hidden transition-all duration-300 transform bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
          <span className="px-3 py-1 text-sm font-medium text-indigo-600 rounded-full bg-indigo-50">
            {quiz.questions?.length || 0} questions
          </span>
        </div>
        <p className="mb-6 text-gray-600 line-clamp-2">{quiz.description}</p>
        <div className="flex justify-end">
          <Link
            to={`/quiz/${quiz._id}/take`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Take Quiz
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizCard;
