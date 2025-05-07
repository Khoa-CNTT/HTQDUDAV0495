import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bg-indigo-100 rounded-full opacity-50 -top-40 -right-40 w-80 h-80 blur-3xl" />
        <div className="absolute bg-purple-100 rounded-full opacity-50 -bottom-40 -left-40 w-80 h-80 blur-3xl" />
      </div>

      <div className="container relative px-4 py-16 mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              CTEWhiz
            </h3>
            <p className="leading-relaxed text-gray-600">
              Empowering educators and students with AI-powered quiz creation
              and assessment tools.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 transition-all duration-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFacebook size={20} />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 transition-all duration-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 transition-all duration-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaLinkedin size={20} />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 transition-all duration-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaInstagram size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-gray-900">Quick Links</h4>
            <ul className="space-y-3">
              {["About Us", "Features", "Pricing", "Contact"].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  className="transition-colors"
                >
                  <a
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="flex items-center text-gray-600 hover:text-indigo-600"
                  >
                    <span className="w-1.5 h-1.5 mr-2 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-gray-900">Resources</h4>
            <ul className="space-y-3">
              {["Blog", "Documentation", "Support", "FAQ"].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  className="transition-colors"
                >
                  <a
                    href={`/${item.toLowerCase()}`}
                    className="flex items-center text-gray-600 hover:text-indigo-600"
                  >
                    <span className="w-1.5 h-1.5 mr-2 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-semibold text-gray-900">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaEnvelope className="w-5 h-5 mt-1 text-indigo-600" />
                <span className="text-gray-600">support@quizwhiz.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaPhone className="w-5 h-5 mt-1 text-indigo-600" />
                <span className="text-gray-600">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 mt-1 text-indigo-600" />
                <span className="text-gray-600">
                  123 Education Street
                  <br />
                  San Francisco, CA 94107
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl p-8 mx-auto mt-16 bg-white shadow-lg rounded-2xl"
        >
          <div className="text-center">
            <h4 className="mb-2 text-xl font-semibold text-gray-900">
              Subscribe to Our Newsletter
            </h4>
            <p className="mb-6 text-gray-600">
              Stay updated with the latest features and educational resources
            </p>
            <form className="flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-8 mt-12 text-center border-t border-gray-200"
        >
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} CTEWhiz. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
