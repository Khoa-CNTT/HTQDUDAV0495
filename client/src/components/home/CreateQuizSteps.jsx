import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const steps = [
  {
    id: "step1",
    title: "Input Your Data",
    subtitle: "Input Text or Notes.",
    description:
      "Start by entering your data—text, study notes, or a collection of these. Our intuitive forms make it easy to provide the content you need.",
    image: "/images/step1.webp",
  },
  {
    id: "step2",
    title: "Customize Options",
    subtitle: "Choose Question Types.",
    description:
      "Create a combination of different question types from your input. Customize options including question type, higher-order questions, and the quantity to generate.",
    image: "/images/step2.webp",
  },
  {
    id: "step3",
    title: "Download and Assess",
    subtitle: "Export and Utilize Quizzes.",
    description:
      "Download your generated quizzes in various file formats and arrangements. Use them for formal assessments, self-study or host them for your students.",
    image: "/images/step3.webp",
  },
];

export default function CreateQuizSteps() {
  const [activeTab, setActiveTab] = useState("step1");

  return (
    <div className="relative px-4 py-16 mx-auto my-10 max-w-7xl sm:px-6 lg:px-8 bg-slate-50">
      <img
        className="absolute z-0 left-1/2 top-0 max-w-none -translate-y-1/4 -translate-x-[30%] opacity-50"
        src="https://www.quizwhiz.ai/static/images/5982fbe6e680d8baa575.webp"
        alt=""
        style={{ width: "1558px", height: "946px" }}
      />
      <div className="text-center">
        <h2 className="relative z-20 text-3xl tracking-tight font-display text-slate-900 sm:text-4xl">
          3 Simple Steps to Create Quizzes
        </h2>
        <p className="mt-4 text-lg tracking-tight text-slate-700">
          Enter data, customize options, generate and utilize your quiz.
        </p>
      </div>

      <Tabs
        defaultValue="step1"
        className="w-full"
        onValueChange={setActiveTab}
      >
        {/* Tab buttons */}
        <TabsList className="relative z-10 grid grid-cols-3 gap-2">
          {steps.map((step, index) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className="flex flex-col items-start p-4 transition border rounded-xl hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center text-white bg-pink-600 rounded-full h-9 w-9">
                  {index + 1}
                </div>
                <h3 className="text-sm font-medium">{step.title}</h3>
              </div>
              <p className="mt-2 text-xs text-slate-600">{step.subtitle}</p>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content with transition effects */}
        {steps.map((step) => (
          <TabsContent key={step.id} value={step.id}>
            <div
              className={`relative p-6 mt-24 overflow-hidden bg-white shadow-lg rounded-xl ring-1 ring-slate-300 animate-fade-left
              }`}
            >
              <img
                src={step.image}
                alt={step.title}
                className="w-full mb-6 rounded-lg"
              />
              <h4 className="mb-2 text-xl font-display text-slate-900">
                {step.subtitle}
              </h4>
              <p className="text-sm text-slate-600">{step.description}</p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
