import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I join affiliate programs through Affitor?',
      answer: 'Simply browse our program directory, click on programs that interest you, and apply directly through our platform. We\'ll track your application status and notify you when you\'re approved.'
    },
    {
      question: 'What commission rates can I expect?',
      answer: 'Commission rates vary by program and industry, typically ranging from 1% to 50%. Our platform shows you the exact rates for each program before you apply, so you can make informed decisions.'
    },
    {
      question: 'How quickly do I get paid?',
      answer: 'Payment schedules depend on individual affiliate programs. Most programs pay monthly, with some offering weekly or bi-weekly payments. We display payment terms clearly for each program.'
    },
    {
      question: 'Is there a minimum payout threshold?',
      answer: 'Minimum payout thresholds vary by program. We aggregate your earnings across programs where possible to help you reach payout thresholds faster.'
    },
    {
      question: 'Can I track performance across all my programs?',
      answer: 'Yes! Our unified dashboard shows performance metrics across all your affiliate programs in one place, including clicks, conversions, and earnings.'
    },
    {
      question: 'Do you provide marketing materials?',
      answer: 'Many of our partner programs provide banners, product images, and promotional content. We organize these materials in your dashboard for easy access.'
    },
    {
      question: 'Is Affitor suitable for beginners?',
      answer: 'Absolutely! We provide educational resources, best practices guides, and step-by-step tutorials to help beginners get started with affiliate marketing.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We offer email support for all users, with priority support for Pro subscribers. Enterprise customers get dedicated account management and phone support.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-blue mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-text">
            Everything you need to know about Affitor
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-light-gray rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-dark-blue pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-text flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-text flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-text leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;