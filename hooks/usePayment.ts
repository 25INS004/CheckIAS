import { useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface PaymentOptions {
  planId: string;
  amount: number; // in paise
  onSuccess: (response: any) => Promise<void>;
  onError?: (error: string) => void;
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

  const createOrder = async (amount: number, planId: string) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        user_id: user?.id,
        plan_id: planId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return response.json();
  };

  const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    planId: string
  ) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        user_id: user?.id,
        plan_id: planId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Payment verification failed');
    }

    return data;
  };

  const openPaymentModal = useCallback(async ({ planId, amount, onSuccess, onError }: PaymentOptions) => {
    setLoading(true);

    try {
      // Step 1: Load Razorpay script
      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      if (!RAZORPAY_KEY_ID) {
        throw new Error('Razorpay Key not found');
      }

      // Step 2: Create order on backend (secure)
      const order = await createOrder(amount, planId);

      if (!order.id) {
        throw new Error('Failed to create order - no order ID returned');
      }

      // Step 3: Open Razorpay checkout with order_id
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "CheckIAS",
        description: `Upgrade to ${planId.toUpperCase()} Plan`,
        image: "https://checkias.com/images/logo-dark.png",
        order_id: order.id, // This is the key fix!
        handler: async function (response: any) {
          try {
            // Step 4: Verify payment on backend
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              planId
            );

            // Step 5: Call success callback
            await onSuccess(response);
          } catch (verifyError: any) {
            console.error('Payment verification failed:', verifyError);
            onError?.(verifyError.message || 'Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
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
      paymentObject.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        onError?.(response.error.description || 'Payment failed');
        setLoading(false);
      });
      paymentObject.open();

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      onError?.(error.message || 'Failed to initialize payment');
      setLoading(false);
    }
  }, [user]);

  return { openPaymentModal, loading };
};

