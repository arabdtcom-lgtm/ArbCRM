
import React, { useState } from 'react';

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "What types of cargo does the company ship?",
      answer: "We ship all types of cargo including dry, refrigerated, and frozen (Reefer Cargo) globally using a door-to-door system."
    },
    {
      question: "Does the company provide customs clearance?",
      answer: "Yes, we specialize in handling all customs procedures at international and domestic ports for both exports and imports to ensure fast release."
    },
    {
      question: "What is the insurance policy at Amazon Marine?",
      answer: "We prioritize cargo safety, providing insurance coverage up to 110% of the customs-accepted invoice value."
    },
    {
      question: "How can I get a quote for my shipment?",
      answer: "For the most accurate price, please provide us with (Commodity Type, Quantity, Origin, and Destination). A sales representative will contact you immediately."
    },
    {
      question: "Does the company offer inland transportation?",
      answer: "Yes, we provide an advanced land transport fleet for moving cargo inside and outside Egypt, adhering to strict delivery schedules and safety standards."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600">Everything you need to know about Amazon Marine logistics services.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-xl overflow-hidden transition-all shadow-sm">
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
              >
                <span className="font-bold text-slate-800">{faq.question}</span>
                <i className={`fas fa-chevron-down text-blue-600 transition-transform ${activeIndex === index ? 'rotate-180' : ''}`}></i>
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-5 bg-slate-50 text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <i className="fas fa-question text-xl"></i>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Didn't find what you're looking for?</h4>
            <p className="text-sm text-blue-700 leading-relaxed">Talk to our smart assistant above or contact us directly during official working hours.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
