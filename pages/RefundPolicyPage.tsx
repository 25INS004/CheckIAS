import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Refund Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">CheckIAS Refund Terms & Conditions</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                CheckIAS is committed to providing quality evaluation services. If you are unsatisfied with our service, please review our refund policy below.
              </p>
            </section>

            <div className="border-t border-gray-200 dark:border-gray-800"></div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Refund Terms</h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">1. Within 24 Hours — 70% Refund</h3>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    If you request a refund within 24 hours of purchase, you are eligible for a 70% refund of the total amount paid.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">2. Within One Week — 40% Refund</h3>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    If you request a refund within 7 days (one week) of purchase, you are eligible for a 40% refund of the total amount paid.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">3. After One Week — Case-by-Case Basis</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Refund requests made after one week will be evaluated on a case-by-case basis. Please contact our support team to discuss your situation.
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 dark:border-gray-800"></div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How to Request a Refund</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Email us at <a href="mailto:support@checkias.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@checkias.com</a> with your order details</li>
                <li>Include your registered email address and reason for refund</li>
                <li>Our team will respond within 24-48 working hours</li>
              </ol>
            </section>

            <div className="border-t border-gray-200 dark:border-gray-800"></div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
              <p className="text-gray-600 dark:text-gray-300">
                For any queries regarding refunds, please reach out to:
              </p>
              <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong>Email:</strong> <a href="mailto:support@checkias.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@checkias.com</a></li>
                <li><strong>Phone:</strong> <a href="tel:+917015823742" className="text-indigo-600 dark:text-indigo-400 hover:underline">+91-7015823742</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
