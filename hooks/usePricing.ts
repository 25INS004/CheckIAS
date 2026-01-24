import { useEffect, useState } from 'react';
import { PRICING_PLANS as DEFAULT_PLANS, PricingPlan } from '../config/pricing';

export const usePricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      // Use direct fetch instead of Supabase SDK to avoid session issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pricing_plans?select=*&order=price.asc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn('Pricing fetch failed:', response.status);
        return;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const transformedPlans: PricingPlan[] = data.map((plan: any) => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          price: Number(plan.price),
          displayPrice: plan.display_price,
          period: plan.period,
          billingNote: plan.billing_note,
          buttonText: plan.button_text,
          link: `/login?plan=${plan.id}`,
          isPopular: plan.is_popular,
          features: plan.features || []
        }));
        setPlans(transformedPlans);
      }
    } catch (err: any) {
      console.warn('Background pricing fetch error:', err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, loading, error, refreshPlans: fetchPlans };
};

