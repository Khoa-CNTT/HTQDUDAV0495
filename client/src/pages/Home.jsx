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
import PublicQuizzes from "@/components/home/PublicQuizzes";
import AnimatedSection from "../components/AnimatedSection"; // Import AnimatedSection

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
      {/* Add animation to the sections below */}
      <AnimatedSection animationClass="transition-opacity duration-700 opacity-100">
        <CreateQuizSteps />
      </AnimatedSection>

      <AnimatedSection animationClass="transition-opacity duration-700 opacity-100">
        <FaqSection />
      </AnimatedSection>

      <AnimatedSection animationClass="transition-opacity duration-700 opacity-100">
        <BlogList />
      </AnimatedSection>
    </div>
  );
};

export default Home;
