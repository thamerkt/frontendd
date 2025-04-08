import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "How does renting work on your platform?", answer: "Lorem ipsum dolor sit amet." },
  { question: "What happens if an item gets damaged?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Can I cancel or modify a rental request?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Is it safe to rent from strangers?", answer: "Lorem ipsum dolor sit amet." },
  { question: "Do you offer customer support?", answer: "Lorem ipsum dolor sit amet." },
  { question: "What payment methods do you accept?", answer: "Lorem ipsum dolor sit amet." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold italic mb-6">Have Any Questions?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-700 py-3">
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between w-full text-left font-medium"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              {openIndex === index && (
                <div className="mt-2 p-4 bg-teal-600 rounded-lg text-left">
                  <p className="text-white">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <h3 className="text-teal-400 text-lg font-semibold">DO YOU STILL HAVE QUESTIONS REGARDING OUR SERVICES?</h3>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto">
            If you have any other questions or need further assistance, feel free to contact us anytime.
          </p>
          <button className="mt-4 bg-teal-500 px-6 py-2 rounded-lg text-white font-medium hover:bg-teal-600 transition">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}