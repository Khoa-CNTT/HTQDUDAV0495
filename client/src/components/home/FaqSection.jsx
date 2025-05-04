import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: 'What is meant by a "credit"?',
    answer:
      "A credit is a unit of currency in QuizWhiz for using AI-related features. For example, generating a quiz with about 30 questions from an input of 400 words costs 1 credit.",
  },
  {
    question: "What types of quizzes can I generate with QuizWhiz?",
    answer:
      "QuizWhiz supports multiple-choice, short questions, true or false, fill in the blanks, scenario-based, and diagram labeling type questions.",
  },
  {
    question: "Can I customize the number of questions generated?",
    answer:
      'Yes, you can control the volume of questions generated with settings like "Fewer," "Moderate," and "More,". Or for full control, you can specify the exact amount.',
  },
  {
    question: "How do I download the quizzes?",
    answer:
      "You can download quizzes in various formats including PDF, DOCX, TXT, MD, HTML, EPUB, and JSON. Options are available to combine different question sets and to merge or separate questions from answers.",
  },
  {
    question: "How are study notes created in QuizWhiz?",
    answer:
      "Study notes can be generated using our AI-powered tool or accessed from the pre-generated notes in the QuizWhiz database, organized by subject, grade level, and board system.",
  },
  {
    question: "How does the self-assessment tool work?",
    answer:
      "The self-assessment tool allows students to take quizzes, track their progress, and identify areas for improvement.",
  },
  {
    question: "What is the AI chat feature?",
    answer:
      "The AI chat feature lets you interact with your saved documents, including texts and study notes, providing instant answers and explanations to make study sessions more interactive.",
  },
  {
    question: "What support is available if I encounter issues with QuizWhiz?",
    answer:
      "If you encounter any issues or have questions, you can reach out to us via email at admin@quizwhiz.ai. We are committed to providing timely and helpful support.",
  },
  {
    question: "Can I decide the difficulty of the questions?",
    answer:
      'For most question type there is an option to choose "Higher Order" to generate questions that require more complex reasoning skills and understanding of the subject matter.',
  },
];

export default function FaqSection() {
  return (
    <div className="max-w-3xl mx-auto">
      <Accordion type="multiple" className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <AccordionItem
              value={`item-${index}`}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 text-left text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
