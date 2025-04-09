import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublicQuizzes } from "../services/api";
import { isAuthenticated } from "../utils/jwtUtils";
import QuizCard from "../components/QuizCard";
import toast from "react-hot-toast";
import Hero from "../components/home/Hero";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isLoggedIn } = useAuth();
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        const data = await getPublicQuizzes();
        setPublicQuizzes(data);
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
    <div>
      <Hero />

      <section>
        <h2 className="mb-6 text-2xl font-bold">Public Quizzes</h2>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        ) : publicQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} showCreator={true} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-lg bg-gray-50">
            <p className="text-gray-600">No public quizzes available yet.</p>
          </div>
        )}
      </section>

      <section className="p-8 mt-16 rounded-lg bg-gray-50">
        <h2 className="mb-4 text-2xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 text-4xl font-bold text-indigo-600">1</div>
            <h3 className="mb-2 text-xl font-semibold">Upload a PDF</h3>
            <p className="text-gray-600">
              Upload any PDF file containing quiz questions in the format "A.
              Option [correct]"
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 text-4xl font-bold text-indigo-600">2</div>
            <h3 className="mb-2 text-xl font-semibold">Generate Quiz</h3>
            <p className="text-gray-600">
              Our system automatically extracts questions and answers from your
              PDF
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 text-4xl font-bold text-indigo-600">3</div>
            <h3 className="mb-2 text-xl font-semibold">Take the Quiz</h3>
            <p className="text-gray-600">
              Take the quiz yourself or share it with others to test their
              knowledge
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
