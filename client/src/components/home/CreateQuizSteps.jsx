import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const steps = [
  {
    id: "step1",
    title: "Input Your Data",
    subtitle: "Input Text or Notes",
    description:
      "Start by entering your data—text, study notes, or a collection of these. Our intuitive forms make it easy to provide the content you need.",
    image: "/images/step1.webp",
  },
  {
    id: "step2",
    title: "Customize Options",
    subtitle: "Choose Question Types",
    description:
      "Create a combination of different question types from your input. Customize options including question type, higher-order questions, and the quantity to generate.",
    image: "/images/step2.webp",
  },
  {
    id: "step3",
    title: "Download and Assess",
    subtitle: "Export and Utilize Quizzes",
    description:
      "Download your generated quizzes in various file formats and arrangements. Use them for formal assessments, self-study or host them for your students.",
    image: "/images/step3.webp",
  },
];

export default function CreateQuizSteps() {
  const [activeTab, setActiveTab] = useState("step1");

  return (
    <div className="relative">
      <Tabs
        defaultValue="step1"
        className="w-full"
        onValueChange={setActiveTab}
      >
        {/* Tab buttons */}
        <TabsList className="relative z-10 grid grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className={`flex flex-col items-start p-4 transition-all duration-300 rounded-xl border ${
                activeTab === step.id
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-md"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center text-white rounded-full h-9 w-9 ${
                  activeTab === step.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                    : "bg-gray-400"
                }`}>
                  {index + 1}
                </div>
                <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
              </div>
              <p className="mt-2 text-xs text-gray-500">{step.subtitle}</p>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content with transition effects */}
        {steps.map((step) => (
          <TabsContent key={step.id} value={step.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`relative p-6 mt-8 overflow-hidden bg-white shadow-lg rounded-2xl ring-1 ring-gray-200 ${
                activeTab === step.id ? "block" : "hidden"
              }`}
            >
              <img
                src={step.image}
                alt={step.title}
                className="w-full mb-6 rounded-lg"
              />
              <h4 className="mb-2 text-xl font-semibold text-gray-900">
                {step.subtitle}
              </h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
