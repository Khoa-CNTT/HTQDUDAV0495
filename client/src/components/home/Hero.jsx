import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HeadHero from "../HeadHero";
import { motion } from "framer-motion";

// ... phần còn lại không đổi


const Hero = () => {
  const { isLoggedIn } = useAuth();

  return (
    <section
      className="relative flex flex-col items-center bg-white lg:bg-cover lg:bg-no-repeat lg:bg-center lg:min-h-screen lg:pt-0"
      style={{ backgroundImage: "url('/images/bgFirstHomepage.jpg')" }}
    >
      <div class="absolute inset-0 bg-white lg:opacity-65 z-0"></div>
      {/* Div top */}
      <div className="z-10 w-full">
        <HeadHero />
      </div>
      <div className="z-10 flex flex-col items-center justify-center flex-1 text-center">
        <motion.h1 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-5xl font-semibold tracking-tight font-display text-slate-9000 sm:text-7xl"
        >
          The{" "}
          <motion.span 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative font-bold whitespace-nowrap text-primary-lighter"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 418 42"
              class="absolute left-0 top-2/3 h-[0.58em] w-full fill-primary/70"
              preserveAspectRatio="none"
            >
              <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path>
            </svg>
            Best Way{" "}
          </motion.span>{" "}
          to Prepare for a Test or Create One
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          class="mx-auto mt-6 max-w-[40rem] text-lg sm:text-xl tracking-tight text-slate-700 leading-relaxed font-normal "
        >
          Effortlessly generate <strong>engaging quizzes</strong> and{" "}
          <strong>comprehensive study-notes</strong> with our advanced
          AI-powered tools. QuizWhiz empowers teachers to create exams and
          students to self-study with ease.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="inline-flex items-center justify-center px-8 py-3 mt-8 text-lg font-semibold text-white bg-teal-600 rounded-full shadow-lg group focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 hover:bg-teal-700 sm:py-4 hover:shadow-xl"
        >
          {isLoggedIn ? (
            <Link to="/dashboard">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register">Get Started</Link>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
