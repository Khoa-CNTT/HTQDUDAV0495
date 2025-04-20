import { Link } from "react-router-dom";

const blogPosts = [
  {
    date: "2024-11-10",
    title:
      "AI-Powered Teaching Assistant Platforms: Reshaping Educational Landscapes",
    description:
      "Artificial intelligence is revolutionizing various sectors, and education is at the forefront of this transformation. AI-powered teaching assistant platforms are emerging as innovative tools that enhance the learning experience for both students and educators.",
    link: "https://julius.ai/articles/top-10-math-ai-tools", // Change to external URL
  },
  {
    date: "2024-11-05",
    title:
      "Revolutionizing Education: A Teacher's Guide to AI in the Classroom",
    description:
      "Artificial Intelligence (AI) is rapidly transforming the educational landscape, offering unprecedented opportunities for teachers to enhance their methods and improve student outcomes.",
    link: "https://julius.ai/articles/top-10-math-ai-tools", // Change to external URL
  },
  {
    date: "2024-10-17",
    title: "Introducing Mithrin.ai: AI-powered Agents and Experts",
    description:
      "As businesses seek to enhance operations and improve customer engagement, Mithrin.ai emerges as a powerful platform that streamlines the integration of artificial intelligence. With two main offerings: AI Agent Creation Platform and specialized AI Experts, Mithrin.ai is tailored to meet diverse business needs.",
    link: "https://julius.ai/articles/top-10-math-ai-tools", // Change to external URL
  },
  {
    date: "2024-09-26",
    title: "The Best Math AI Tools to Quickly Enhance Your Skills",
    description:
      "In today's fast-paced digital world, mastering mathematics has become more crucial than ever. Whether you're a student grappling with complex equations, a professional seeking to sharpen your analytical skills, or simply someone looking to improve your math prowess, artificial intelligence (AI) offers powerful tools to assist you on your journey.",
    link: "https://julius.ai/articles/top-10-math-ai-tools", // Change to external URL
  },
];

export default function BlogList() {
  return (
    <div className="grid grid-cols-1 px-6 mx-auto max-w-7xl gap-x-8 gap-y-12 sm:gap-y-16 lg:grid-cols-2 lg:px-8">
      <article className="w-full max-w-2xl mx-auto lg:mx-0 lg:max-w-lg">
        <time className="block text-sm italic font-semibold text-gray-700">
          {blogPosts[0].date}
        </time>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          {blogPosts[0].title}
        </h2>
        <p className="mt-4 text-lg text-gray-600">{blogPosts[0].description}</p>
        <div className="mt-6 sm:mt-8">
          <a
            href={blogPosts[0].link} // Changed to <a> for external links
            className="text-sm font-semibold text-primary-textPri"
            target="_blank" // Opens in a new tab
            rel="noopener noreferrer"
          >
            Continue reading <span aria-hidden="true">→</span>
          </a>
        </div>
      </article>

      <div className="w-full max-w-2xl pt-12 mx-auto border-t border-gray-900/10 sm:pt-16 lg:mx-0 lg:max-w-none lg:border-t-0 lg:pt-0">
        <div className="-my-6 divide-y divide-gray-900/10">
          {blogPosts.slice(1).map((post, idx) => (
            <article key={idx} className="py-6">
              <time className="block text-sm italic font-semibold text-gray-700">
                {post.date}
              </time>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                {post.title}
              </h3>
              <p className="mt-4 text-sm text-primary">{post.description}</p>
              <div className="mt-4">
                <a
                  href={post.link} // Changed to <a> for external links
                  className="text-sm font-semibold text-primary-textPri"
                  target="_blank" // Opens in a new tab
                  rel="noopener noreferrer"
                >
                  Continue reading <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
