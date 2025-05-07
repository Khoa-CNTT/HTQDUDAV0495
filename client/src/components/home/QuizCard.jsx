import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlay, FaClock, FaUsers } from "react-icons/fa";

const QuizCard = ({ quiz }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-100px" }}
      className="group relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-2xl"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.h3 
            className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
          >
            {quiz.title}
          </motion.h3>
          <motion.span 
            className="px-3 py-1 text-sm font-medium text-indigo-600 rounded-full bg-indigo-50"
            whileHover={{ scale: 1.05 }}
          >
            {quiz.questions?.length || 0} questions
          </motion.span>
        </div>

        {/* Description */}
        <p className="mb-6 text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
          {quiz.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FaClock className="w-4 h-4" />
            <span>{quiz.timeLimit || 'No time limit'}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUsers className="w-4 h-4" />
            <span>{quiz.participants || 0} participants</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              to={`/quiz/${quiz._id}/take`}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl"
            >
              <FaPlay className="w-4 h-4 mr-2" />
              Take Quiz
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizCard;
