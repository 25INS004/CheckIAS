import React, { useState } from 'react';
import { Check, X, Shield, Zap, Info } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { usePayment } from '../hooks/usePayment';
import { useProfile } from '../hooks/useProfile';

const FEATURES = {
  free: [
    { text: '2 Submissions (Lifetime)', included: true },
    { text: 'Basic Feedback', included: true },
    { text: 'Model Answers', included: false },
    { text: 'Mentor Call', included: false }
  ],
  starter: [
    { text: 'Unlimited Submissions', included: true },
    { text: 'Basic Feedback', included: true },
    { text: '24h Turnaround', included: true },
    { text: '2 calls per month', included: true }
  ],
  pro: [
    { text: 'Unlimited Submissions', included: true },
    { text: 'Detailed Feedback', included: true },
    { text: 'Model Answers', included: true },
    { text: '6 calls per 3 months', included: true }
  ],
  achiever: [
    { text: 'Unlimited Submissions', included: true },
    { text: 'Personal Mentor', included: true },
    { text: 'Daily Targets', included: true },
    { text: 'Live Evaluation', included: true },
    { text: '12 calls per 6 months', included: true }
  ]
};

const PLANS = [
  {
    id: 'free',
    title: 'Free',
    description: 'Try before you commit.',
    price: 0,
    displayPrice: '₹0',
    period: '/ lifetime',
    features: FEATURES.free
  },
  {
    id: 'starter',
    title: 'Starter',
    description: 'Great for occasional evaluation.',
    price: 999,
    displayPrice: '₹999',
    period: '/ month',
    features: FEATURES.starter
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'For serious aspirants.',
    price: 2499,
    displayPrice: '₹2,499',
    period: '/ 3 months',
    isPopular: true,
    features: FEATURES.pro
  },
  {
    id: 'achiever',
    title: 'Achiever',
    description: 'For rank holders.',
    price: 4999,
    displayPrice: '₹4,999',
    period: '/ 6 months',
    features: FEATURES.achiever
  }
];

const PlansPage = () => {
  const { user, updateUser } = useUser();
  const { openPaymentModal, loading: paymentLoading } = usePayment();
  const { updateProfile } = useProfile();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (!user) return;
    
    // Safety check
    if (user.plan === plan.id) return;

    setProcessingId(plan.id);

    try {
      if (plan.price === 0) {
        // Handle downgrade to free? Usually not allowed easily or just direct update
        // For MVP, allow downgrade if they want, but usually it's locked.
        // Let's assume user wants to switch.
         alert('To downgrade to Free, please contact support.');
         setProcessingId(null);
         return;
      }

      await openPaymentModal({
        planId: plan.id,
        amount: plan.price * 100, // in paise
        onSuccess: async (response) => {
          console.log('Payment success', response);
          
          // Update DB
          const { success, error } = await updateProfile({ plan: plan.id as any });
          
          if (success) {
            updateUser({ plan: plan.id as any });
            alert(`Successfully upgraded to ${plan.title}!`);
          } else {
            console.error('Profile update failed:', error);
            alert('Payment successful but failed to update subscription. Please contact support with Payment ID: ' + response.razorpay_payment_id);
          }
        }
      });
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setProcessingId(null);
    }
  };

  const getButtonState = (planId: string) => {
    if (!user) return { text: 'Login to Buy', disabled: true };
    if (user.plan === planId) return { text: 'Current Plan', disabled: true };
    if (paymentLoading || processingId === planId) return { text: 'Processing...', disabled: true };
    
    // Logic for Downgrade vs Upgrade (simplified)
    const levels = { free: 0, starter: 1, pro: 2, achiever: 3 };
    const currentLevel = levels[user.plan as keyof typeof levels] || 0;
    const planLevel = levels[planId as keyof typeof levels] || 0;

    if (planLevel < currentLevel) return { text: 'Downgrade', disabled: false }; // Allow click but maybe handle via support msg
    
    return { text: 'Upgrade', disabled: false };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upgrade your plan to unlock more features and mentorship.</p>
      </div>

       {/* Current Plan Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-indigo-100 font-medium">Current Plan</p>
            <h2 className="text-2xl font-bold capitalize">{user?.plan || 'Free'} Plan</h2>
          </div>
          <div className="ml-auto hidden sm:block">
            <Zap className="w-12 h-12 text-white/20" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
           const { text: buttonText, disabled } = getButtonState(plan.id);
           const isCurrent = user?.plan === plan.id;

           return (
            <div 
              key={plan.id}
              className={`
                relative flex flex-col p-6 rounded-2xl border transition-all duration-300 h-full
                ${isCurrent 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500 dark:ring-indigo-400' 
                  : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1'
                }
              `}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-bl-xl rounded-tr-xl">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.displayPrice}</span>
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{plan.period}</span>
              </div>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={disabled}
                className={`
                  w-full py-2.5 rounded-xl font-semibold text-sm mb-6 transition-all
                  ${isCurrent
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
                    : buttonText === 'Downgrade'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  }
                  ${disabled && !isCurrent ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isCurrent && <Check className="w-4 h-4 inline mr-1.5" />}
                {buttonText}
              </button>

              <div className="mt-auto space-y-3">
                <p className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Features</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-3 text-sm ${!feature.included ? 'opacity-50' : ''}`}>
                      {feature.included ? (
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
                      )}
                      <span className={`leading-tight ${feature.included ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default PlansPage;
