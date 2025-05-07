import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublicQuizzes } from "../services/api";
import toast from "react-hot-toast";
import Hero from "../components/home/Hero";
import { useAuth } from "../context/AuthContext";
import CreateQuizSteps from "@/components/home/CreateQuizSteps";
import FaqSection from "@/components/home/FaqSection";
import BlogList from "@/components/home/BlogList";
import Footer from "@/components/Footer";
import QuizCard from "@/components/home/QuizCard";
import { motion } from "framer-motion";

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
        } else {
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>

      <Hero />

      <div className="relative">
        {/* Popular Quizzes Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-24 bg-white/80 backdrop-blur-sm"
        >
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Popular Quizzes
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Discover and take quizzes created by our community. Test your
                knowledge and learn something new!
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : publicQuizzes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-600">
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
          </div>
        </motion.section>

        {/* Create Quiz Steps Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
        >
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Create Your Own Quiz
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Follow these simple steps to create engaging quizzes for your
                students or yourself
              </p>
            </motion.div>
            <CreateQuizSteps />
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-24 bg-white/80 backdrop-blur-sm"
        >
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Frequently Asked Questions
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Find answers to common questions about our platform
              </p>
            </motion.div>
            <FaqSection />
          </div>
        </motion.section>

        {/* Blog Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
        >
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-8 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Latest Updates
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-gray-600">
                Stay informed with our latest news and educational insights
              </p>
            </motion.div>
            <BlogList />
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
