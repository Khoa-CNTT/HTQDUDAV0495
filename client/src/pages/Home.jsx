import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublicQuizzes } from "../services/api";
import Hero from "../components/home/Hero";
import { useAuth } from "../context/AuthContext";
import CreateQuizSteps from "@/components/home/CreateQuizSteps";
import FaqSection from "@/components/home/FaqSection";
import BlogList from "@/components/home/BlogList";
import QuizCard from "@/components/home/QuizCard";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { FaGamepad, FaStar, FaTrophy, FaUsers } from "react-icons/fa";

const Home = () => {
  const { isLoggedIn } = useAuth();
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        const response = await getPublicQuizzes();
        if (response.success) {
          setPublicQuizzes(response.data);
        }
      } catch (error) {
        console.error("Error fetching public quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-x-hidden">
      {/* Animated SVG background */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{filter:'blur(2px)'}}>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.circle 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="80%" 
          cy="20%" 
          r="300" 
          fill="url(#g1)"
        >
          <animate 
            attributeName="cx" 
            values="80%;20%;80%" 
            dur="12s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="r" 
            values="300;350;300" 
            dur="8s" 
            repeatCount="indefinite" 
          />
        </motion.circle>
        <motion.circle 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          cx="20%" 
          cy="80%" 
          r="200" 
          fill="url(#g1)"
        >
          <animate 
            attributeName="cy" 
            values="80%;20%;80%" 
            dur="16s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="r" 
            values="200;250;200" 
            dur="10s" 
            repeatCount="indefinite" 
          />
        </motion.circle>
        <motion.circle 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          cx="50%" 
          cy="50%" 
          r="150" 
          fill="url(#g1)"
        >
          <animate 
            attributeName="cx" 
            values="50%;70%;50%" 
            dur="14s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="cy" 
            values="50%;30%;50%" 
            dur="14s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="r" 
            values="150;200;150" 
            dur="12s" 
            repeatCount="indefinite" 
          />
        </motion.circle>
      </svg>

      <div className="relative z-10">
        <Hero />

        {/* Popular Quizzes Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Explore Popular Quizzes
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Discover and take quizzes created by our community. Test your
                knowledge and learn something new!
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-16 h-16 border-4 border-pink-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : publicQuizzes.length === 0 ? (
              <div className="py-12 text-center bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40">
                <p className="text-xl text-pink-200 font-orbitron">
                  No quizzes available at the moment.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {publicQuizzes.slice(0, 6).map((quiz) => (
                  <QuizCard key={quiz._id} quiz={quiz} />
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
              className="mt-12 text-center"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
              >
                <span>View All Quizzes</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Create Quiz Steps Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Create Your Own Quiz
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Follow these simple steps to create engaging quizzes for your
                students or yourself
              </p>
            </motion.div>
            <div className="p-8 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40">
              <CreateQuizSteps />
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Frequently Asked Questions
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Find answers to common questions about our platform
              </p>
            </motion.div>
            <div className="p-8 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40">
              <FaqSection />
            </div>
          </div>
        </motion.section>

        {/* Blog Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Latest Updates
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Stay informed with our latest news and educational insights
              </p>
            </motion.div>
            <div className="p-8 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40">
              <BlogList />
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
