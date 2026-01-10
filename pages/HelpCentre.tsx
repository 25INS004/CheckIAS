import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Mail, Phone, MapPin, MessageSquare, ArrowRight, Clock, FileText, CreditCard, User, Shield } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click on "Get Started" or "Sign Up" button on our homepage. Enter your email address, verify it with OTP, and create a secure password. You\'ll have instant access to your dashboard.'
  },
  {
    category: 'Getting Started',
    question: 'Is there a free plan available?',
    answer: 'Yes! Every new user gets 2 free answer copy evaluations. This allows you to experience our service quality before upgrading to a premium plan.'
  },
  {
    category: 'Getting Started',
    question: 'What file formats are accepted for submission?',
    answer: 'We accept PDF files only. Please ensure your scanned answer copies are in PDF format with a maximum file size of 20MB.'
  },
  // Submissions
  {
    category: 'Submissions',
    question: 'How long does it take to get my copy evaluated?',
    answer: 'Standard evaluation takes 3-5 business days. Premium users with priority evaluation can expect results within 24-48 hours.'
  },
  {
    category: 'Submissions',
    question: 'Can I submit answer copies for any UPSC paper?',
    answer: 'Yes, we accept GS Paper I-IV, Essay, and Optional papers. Select the appropriate subject and paper code while submitting.'
  },
  {
    category: 'Submissions',
    question: 'What feedback will I receive?',
    answer: 'You\'ll receive detailed annotations on your answer copy, an overall score, section-wise marks, areas of improvement, and personalized suggestions from expert mentors.'
  },
  // Subscriptions & Payments
  {
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets through our secure payment partner Razorpay.'
  },
  {
    category: 'Payments',
    question: 'Do subscriptions auto-renew?',
    answer: 'No, our subscriptions do not auto-renew. You\'ll need to manually renew your plan before expiry to continue enjoying premium features.'
  },
  {
    category: 'Payments',
    question: 'What is your refund policy?',
    answer: 'Refund requests are evaluated on a case-by-case basis. If approved, refunds are processed within 7 working days. Services already substantially used may not be eligible for refunds.'
  },
  // Account
  {
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page, enter your registered email, verify with OTP, and set a new password.'
  },
  {
    category: 'Account',
    question: 'Can I use my account on multiple devices?',
    answer: 'Your account can be accessed from any device, but concurrent sessions on multiple devices are not allowed for security reasons.'
  },
  // Mentor Calls
  {
    category: 'Mentor Calls',
    question: 'How do I book a mentor call?',
    answer: 'Mentor calls are available for premium subscribers. Go to Dashboard → Mentor Calls → Book New Call. Select your preferred date, time slot, and topic.'
  },
  {
    category: 'Mentor Calls',
    question: 'What is the call duration?',
    answer: 'Each mentor call is approximately 1 hour long. You can discuss your preparation strategy, get personalized guidance, or review specific topics.'
  },
];

const categories = ['All', 'Getting Started', 'Submissions', 'Payments', 'Account', 'Mentor Calls'];

const categoryIcons: Record<string, React.ReactNode> = {
  'Getting Started': <HelpCircle className="w-5 h-5" />,
  'Submissions': <FileText className="w-5 h-5" />,
  'Payments': <CreditCard className="w-5 h-5" />,
  'Account': <User className="w-5 h-5" />,
  'Mentor Calls': <Phone className="w-5 h-5" />,
};

const HelpCentre = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const filteredFAQs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-black text-gray-900 dark:text-white">CHECKIAS</Link>
          <Link 
            to="/login" 
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Help Centre</h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            Find answers to common questions or reach out to our support team for personalized assistance.
          </p>
        </div>
      </section>

      {/* Instant Help CTA */}
      <section className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Need Instant Help?</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Login to your dashboard and raise a support ticket. Our team typically responds within 24 hours.
              </p>
            </div>
            <Link 
              to="/login"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Login & Raise Ticket
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFAQs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {categoryIcons[faq.category]}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 ml-8">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Our support team is here to help. Reach out to us through any of the following channels.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Email</h3>
              <a href="mailto:support@checkias.com" className="text-indigo-400 hover:text-indigo-300 text-sm">
                support@checkias.com
              </a>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Phone</h3>
              <a href="tel:+917015823742" className="text-green-400 hover:text-green-300 text-sm">
                +91-7015823742
              </a>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Address</h3>
              <p className="text-yellow-400 text-sm">
                Near Gol Chakar, Karol Bagh, New Delhi
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Support Hours: 9:00 AM - 6:00 PM IST (Mon-Sat)</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 CheckIAS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms-of-service" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms</Link>
            <Link to="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400">Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpCentre;
