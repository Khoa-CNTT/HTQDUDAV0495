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
          toast.error(response.message || "Failed to load public quizzes");
        }
      } catch (error) {
        console.error("Error fetching public quizzes:", error);
        toast.error("Failed to load public quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Hero />

      <div className="w-full">
        {/* Popular Quizzes Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-16 bg-white"
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Popular Quizzes</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover and take quizzes created by our community. Test your knowledge and learn something new!
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
              </div>
            ) : publicQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No quizzes available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publicQuizzes.slice(0, 6).map((quiz) => (
                  <QuizCard key={quiz._id} quiz={quiz} />
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Create Quiz Steps Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-3 bg-gray-50"
        >
          <div className="container mx-auto px-4">
            <CreateQuizSteps />
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-3 bg-gray-50"
        >
          <FaqSection />
        </motion.section>

        {/* Blog Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="py-3 bg-gray-50"
        >
          <div className="container mx-auto px-4">
            <BlogList />
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
