import { useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface PaymentOptions {
  planId: string;
  amount: number; // in paise
  onSuccess: (response: any) => Promise<void>;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const loadScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openPaymentModal = useCallback(async ({ planId, amount, onSuccess }: PaymentOptions) => {
    setLoading(true);
    const res = await loadScript();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      alert('Razorpay Key not found');
      setLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount,
      currency: "INR",
      name: "CheckIAS",
      description: `Upgrade to ${planId.toUpperCase()} Plan`,
      image: "https://checkias.com/logo.png",
      handler: async function (response: any) {
        // In a real app, verify signature here
        await onSuccess(response);
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      notes: {
        plan_id: planId,
        user_id: user?.id
      },
      theme: {
        color: "#4f46e5"
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
        }
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  }, [user]);

  return { openPaymentModal, loading };
};
