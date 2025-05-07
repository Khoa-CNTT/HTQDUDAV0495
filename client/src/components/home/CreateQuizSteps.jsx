import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPencilAlt,
  FaCog,
  FaRocket,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const steps = [
  {
    id: "step1",
    title: "Design Your Quiz",
    subtitle: "Create & Customize",
    description:
      "Start by designing your quiz with our intuitive interface. Choose from multiple question types, set difficulty levels, and customize the appearance to match your brand.",
    image: "/images/step1.webp",
    icon: <FaPencilAlt className="w-6 h-6" />,
    features: [
      "Multiple question types",
      "Custom difficulty levels",
      "Brand customization",
      "Rich media support",
    ],
  },
  {
    id: "step2",
    title: "Configure Settings",
    subtitle: "Fine-tune & Optimize",
    description:
      "Fine-tune your quiz settings for the perfect experience. Set time limits, scoring rules, and feedback options to create an engaging assessment.",
    image: "/images/step2.webp",
    icon: <FaCog className="w-6 h-6" />,
    features: [
      "Time management",
      "Scoring system",
      "Feedback options",
      "Progress tracking",
    ],
  },
  {
    id: "step3",
    title: "Launch & Share",
    subtitle: "Publish & Engage",
    description:
      "Launch your quiz and share it with your audience. Track results in real-time, analyze performance, and gather valuable insights.",
    image: "/images/step3.webp",
    icon: <FaRocket className="w-6 h-6" />,
    features: [
      "Instant publishing",
      "Share options",
      "Real-time analytics",
      "Performance insights",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function CreateQuizSteps() {
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = () => {
    setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative max-w-6xl px-4 py-3 mx-auto"
    >
      {/* Progress Bar */}
      <div className="relative mb-12">
        <div className="absolute left-0 w-full h-1 -translate-y-1/2 bg-gray-200 rounded-full top-1/2">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <motion.button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`relative z-10 flex flex-col items-center gap-2 ${
                index <= activeStep ? "text-indigo-600" : "text-gray-400"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                  index <= activeStep
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                {step.icon}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden bg-white shadow-xl rounded-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-64 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
              <img
                src={steps[activeStep].image}
                alt={steps[activeStep].title}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {steps[activeStep].title}
                </h3>
                <p className="text-lg font-medium text-indigo-600">
                  {steps[activeStep].subtitle}
                </p>
              </div>

              <p className="mb-8 text-gray-600">
                {steps[activeStep].description}
              </p>

              <ul className="mb-8 space-y-4">
                {steps[activeStep].features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50">
                      <FaCheckCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <motion.button
                  onClick={prevStep}
                  disabled={activeStep === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                    activeStep === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  whileHover={activeStep > 0 ? { scale: 1.05 } : {}}
                  whileTap={activeStep > 0 ? { scale: 0.95 } : {}}
                >
                  <FaArrowRight className="w-4 h-4 rotate-180" />
                  Previous
                </motion.button>

                <motion.button
                  onClick={nextStep}
                  disabled={activeStep === steps.length - 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                    activeStep === steps.length - 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  }`}
                  whileHover={
                    activeStep < steps.length - 1 ? { scale: 1.05 } : {}
                  }
                  whileTap={
                    activeStep < steps.length - 1 ? { scale: 0.95 } : {}
                  }
                >
                  Next
                  <FaArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
