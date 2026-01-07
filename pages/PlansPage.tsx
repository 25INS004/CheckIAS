import React, { useState, useCallback, useEffect } from 'react';
import { Check, X, Shield, Zap, ChevronLeft, ChevronRight, Tag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { usePayment } from '../hooks/usePayment';
import { useProfile } from '../hooks/useProfile';
import useEmblaCarousel from 'embla-carousel-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applicable_plans: string[];
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  max_uses_per_user: number;
  uses_count: number;
  is_active: boolean;
}

const FEATURES = {
  free: [
    { text: '1 Trial Submission', included: true },
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { openPaymentModal, loading: paymentLoading } = usePayment();
  const { updateProfile } = useProfile();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setValidatingCoupon(true);
    setCouponError('');
    
    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) throw new Error('Not authenticated');
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupons?code=eq.${couponCode.toUpperCase()}&is_active=eq.true&select=*`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();
      
      if (!data || data.length === 0) {
        setCouponError('Invalid coupon code');
        setAppliedCoupon(null);
        return;
      }

      const coupon = data[0] as Coupon;

      // Check validity
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        setCouponError('This coupon has expired');
        setAppliedCoupon(null);
        return;
      }

      if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
        setCouponError('This coupon has reached its usage limit');
        setAppliedCoupon(null);
        return;
      }

      // Check user usage
      const usageRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupon_uses?coupon_id=eq.${coupon.id}&user_id=eq.${user?.id}&select=id`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const usageData = await usageRes.json();
      
      if (usageData.length >= coupon.max_uses_per_user) {
        setCouponError('You have already used this coupon');
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(coupon);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      console.error('Coupon validation error:', err);
      setCouponError('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const getDiscountedPrice = (originalPrice: number, planId: string) => {
    if (!appliedCoupon) return originalPrice;
    if (!appliedCoupon.applicable_plans.includes(planId)) return originalPrice;

    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round(originalPrice * (1 - appliedCoupon.discount_value / 100));
    } else {
      return Math.max(0, originalPrice - appliedCoupon.discount_value);
    }
  };

  const recordCouponUsage = async (planId: string, originalAmount: number, finalAmount: number, paymentId: string) => {
    if (!appliedCoupon || !user) return;

    try {
      const token = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
      if (!token) return;
      const { currentSession } = JSON.parse(token);
      const accessToken = currentSession?.access_token;

      // Record usage
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/coupon_uses`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coupon_id: appliedCoupon.id,
          user_id: user.id,
          plan_purchased: planId,
          original_amount: originalAmount,
          discount_applied: originalAmount - finalAmount,
          final_amount: finalAmount,
          payment_id: paymentId
        })
      });

      // Increment uses_count safely via RPC
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/increment_coupon_usage`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coupon_id: appliedCoupon.id })
      });
    } catch (err) {
      console.error('Failed to record coupon usage:', err);
    }
  };

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (!user) return;
    
    // Safety check
    if (user.plan === plan.id) return;

    setProcessingId(plan.id);

    try {
      if (plan.price === 0) {
         toast.info('To downgrade to Free, please contact support.');
         setProcessingId(null);
         return;
      }

      const originalPrice = plan.price;
      const finalPrice = getDiscountedPrice(plan.price, plan.id);

      await openPaymentModal({
        planId: plan.id,
        amount: finalPrice * 100, // in paise
        onSuccess: async (response) => {
          console.log('Payment success', response);
          
          // Record coupon usage if applied
          if (appliedCoupon) {
            await recordCouponUsage(plan.id, originalPrice, finalPrice, response.razorpay_payment_id);
          }
          
          const { success, error } = await updateProfile({ 
            plan: plan.id as any,
            plan_started_at: new Date().toISOString()
          });
          
          if (success) {
            updateUser({ plan: plan.id as any });
            toast.success(`Successfully upgraded to ${plan.title}!`);
            setAppliedCoupon(null);
            setCouponCode('');
          } else {
            console.error('Profile update failed:', error);
            toast.error('Payment successful but failed to update subscription. Please contact support with Payment ID: ' + response.razorpay_payment_id);
          }
        }
      });
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setProcessingId(null);
    }
  };

  const getButtonState = (planId: string) => {
    if (!user) return { text: 'Login to Buy', disabled: true };
    if (user.plan === planId) return { text: 'Current Plan', disabled: true };
    if (paymentLoading || processingId === planId) return { text: 'Processing...', disabled: true };
    
    const levels = { free: 0, starter: 1, pro: 2, achiever: 3 };
    const currentLevel = levels[user.plan as keyof typeof levels] || 0;
    const planLevel = levels[planId as keyof typeof levels] || 0;

    if (planLevel < currentLevel) return { text: 'Downgrade', disabled: false };
    
    return { text: 'Upgrade', disabled: false };
  };

  const renderPlanCard = (plan: typeof PLANS[0]) => {
    const { text: buttonText, disabled } = getButtonState(plan.id);
    const isCurrent = user?.plan === plan.id;
    const originalPrice = plan.price;
    const discountedPrice = getDiscountedPrice(plan.price, plan.id);
    const hasDiscount = appliedCoupon && discountedPrice < originalPrice && appliedCoupon.applicable_plans.includes(plan.id);

    return (
      <div 
        className={`
          relative flex flex-col p-6 rounded-2xl border transition-all duration-300 h-full min-h-[380px]
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

        <div className="mb-6 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-medium text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">₹{discountedPrice.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.displayPrice}</span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">{plan.period}</span>
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

      {/* Coupon Code Section */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Tag className="w-5 h-5 text-indigo-500" />
            <span className="font-medium">Have a coupon?</span>
          </div>
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponError('');
              }}
              placeholder="Enter code"
              disabled={!!appliedCoupon}
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            {appliedCoupon ? (
              <button
                onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={validateCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {validatingCoupon && <Loader2 className="w-4 h-4 animate-spin" />}
                Apply
              </button>
            )}
          </div>
        </div>
        {couponError && (
          <p className="text-red-500 text-sm mt-2">{couponError}</p>
        )}
        {appliedCoupon && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
            <p className="text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              {appliedCoupon.discount_type === 'percentage' 
                ? `${appliedCoupon.discount_value}% off` 
                : `₹${appliedCoupon.discount_value} off`
              } applied!
              {appliedCoupon.applicable_plans.length < 3 && (
                <span className="text-sm font-normal">(Valid for {appliedCoupon.applicable_plans.join(', ')} plans)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Carousel with Navigation */}
      <div className="lg:hidden relative">
        {/* Left Arrow */}
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-lg backdrop-blur-sm"
          aria-label="Previous plan"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel */}
        <div className="overflow-hidden px-10" ref={emblaRef}>
          <div className="flex -ml-4">
            {PLANS.map((plan) => (
              <div key={plan.id} className="flex-[0_0_100%] sm:flex-[0_0_80%] pl-4 min-w-0">
                {renderPlanCard(plan)}
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-lg backdrop-blur-sm"
          aria-label="Next plan"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex 
                  ? 'bg-indigo-600 w-4' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.id}>
            {renderPlanCard(plan)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
