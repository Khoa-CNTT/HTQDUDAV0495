import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              QuizWhiz
            </h3>
            <p className="text-gray-600">
              Empowering educators and students with AI-powered quiz creation
              and assessment tools.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/blog"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/docs"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-600 transition-colors hover:text-indigo-600"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-indigo-600"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-indigo-600"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-indigo-600"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-indigo-600"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8 mt-12 text-center text-gray-600 border-t border-gray-200"
        >
          <p>&copy; 2024 QuizWhiz. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
