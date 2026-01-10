// Shared pricing configuration for consistency across the entire website
// This is the single source of truth for all pricing-related data

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  title: string;
  description: string;
  price: number;
  displayPrice: string;
  period: string;
  billingNote?: string;
  buttonText?: string;
  link?: string;
  isPopular?: boolean;
  features: PricingFeature[];
}

export const PRICING_FEATURES: Record<string, PricingFeature[]> = {
  free: [
    { text: '3 Submissions (lifetime)', included: true },
    { text: '1 Mentor Call (lifetime)', included: true },
    { text: 'Detailed Feedback', included: true },
    { text: '24h Turnaround', included: false },
    { text: 'Ticket Solve within 24h', included: false }
  ],
  starter: [
    { text: '3 GS Papers + 1 Optional or 75 Questions', included: true },
    { text: '2 Mentorship Calls per Week', included: true },
    { text: 'Detailed Feedback', included: true },
    { text: '18h Turnaround', included: true },
    { text: 'Model Answer (Low Score Questions)', included: true },
    { text: 'Ticket Solution 24 Hours', included: true }
  ],
  pro: [
    { text: 'Unlimited Submissions', included: true },
    { text: '2 Mentorship Calls per Week', included: true },
    { text: 'Detailed Feedback', included: true },
    { text: '18h Turnaround', included: true },
    { text: 'Model Answer (Low Score Questions)', included: true },
    { text: 'Ticket Solution 24 Hours', included: true }
  ],
  achiever: [
    { text: 'Unlimited Submissions', included: true },
    { text: '2 Mentorship Calls per Week', included: true },
    { text: 'Detailed Feedback', included: true },
    { text: '18h Turnaround', included: true },
    { text: 'Model Answer (Low Score Questions)', included: true },
    { text: 'Ticket Solution 24 Hours', included: true }
  ]
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Try before you commit.',
    price: 0,
    displayPrice: '₹0',
    period: '/ lifetime',
    billingNote: 'No Credit Card Required',
    buttonText: 'Get Started',
    link: '/login',
    features: PRICING_FEATURES.free
  },
  {
    id: 'starter',
    title: 'Starter',
    description: 'Great for occasional evaluation.',
    price: 999,
    displayPrice: '₹999',
    period: '/ month',
    billingNote: 'Billed Monthly',
    buttonText: 'Get Started',
    link: '/login?plan=starter',
    features: PRICING_FEATURES.starter
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'For serious aspirants.',
    price: 2499,
    displayPrice: '₹2,499',
    period: '/ 3 months',
    billingNote: 'Billed Quarterly',
    buttonText: 'Get Started',
    link: '/login?plan=pro',
    isPopular: true,
    features: PRICING_FEATURES.pro
  },
  {
    id: 'achiever',
    title: 'Achiever',
    description: 'For rank holders.',
    price: 4999,
    displayPrice: '₹4,999',
    period: '/ 6 months',
    billingNote: 'Billed Biannually',
    buttonText: 'Get Started',
    link: '/login?plan=achiever',
    features: PRICING_FEATURES.achiever
  }
];

export default PRICING_PLANS;
