import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="py-8 text-white bg-slate-100">
      <div className="px-6 mx-auto max-w-7xl">
        {/* Social Media Section */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 text-sm text-center text-gray-400">
          <p>&copy; 2024 QuizWhiz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
