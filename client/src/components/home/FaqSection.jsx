import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative py-20 overflow-hidden bg-slate-50 sm:py-32"
    >
      <img
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 -translate-x-[30%] opacity-50"
        src="https://www.quizwhiz.ai/static/images/5982fbe6e680d8baa575.webp"
        alt=""
        style={{ width: "1558px", height: "946px" }}
      />
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2
            id="faq-title"
            className="text-3xl tracking-tight font-display text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can't find what you're looking for, email us at{" "}
            <strong>admin@quizwhiz.ai</strong>
          </p>
        </div>

        <div className="max-w-2xl mx-auto mt-16 lg:max-w-5xl">
          <Accordion type="multiple" className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg font-medium text-left text-slate-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
