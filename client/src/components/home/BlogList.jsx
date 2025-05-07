import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const BlogList = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Education: AI-Powered Learning",
      description:
        "Explore how artificial intelligence is revolutionizing the way we learn and teach in modern classrooms.",
      link: "https://www.google.com/search?q=The+Future+of+Education+AI+Powered+Learning",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
      category: "Education",
      date: "March 15, 2024",
    },
    {
      id: 2,
      title: "Creating Engaging Quizzes: Best Practices",
      description:
        "Learn the secrets to crafting quizzes that captivate and educate your audience effectively.",
      link: "https://workspace.google.com/marketplace/app/quiz_tool_best_practices/",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      category: "Tips & Tricks",
      date: "March 10, 2024",
    },
    {
      id: 3,
      title: "The Science of Learning: How Quizzes Help",
      description:
        "Discover the psychological benefits of regular quizzing and how it enhances knowledge retention.",
      link: "https://scholar.google.com/scholar?q=The+Science+of+Learning+Quizzes",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Research",
      date: "March 5, 2024",
    },
  ];

  return (
    <div className="py-16">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative overflow-hidden transition-all duration-300 bg-white shadow-lg group rounded-xl hover:shadow-xl"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></div>
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform duration-500 transform group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center mb-2 text-sm text-gray-500">
                  <span>{post.date}</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-indigo-600">
                  {post.title}
                </h3>
                <p className="mb-4 text-gray-600 line-clamp-2">
                  {post.description}
                </p>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={post.link}
                  className="inline-flex items-center font-medium text-indigo-600 transition-colors duration-300 group-hover:text-indigo-700"
                >
                  Read More
                  <FaArrowRight className="ml-2 transition-transform duration-300 transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:opacity-100"></div>
            </motion.article>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <a
            href="https://google.com"
            target="_blank"
            className="inline-flex items-center px-6 py-3 font-medium text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1"
          >
            View All Articles
            <FaArrowRight className="ml-2" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogList;
