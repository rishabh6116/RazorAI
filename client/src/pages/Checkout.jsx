import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/session';
import * as api from '../services/api';

export default function Checkout() {
  const { cart, sessionId, refreshCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  const startPayment = async () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (typeof window.Razorpay === 'undefined') {
      toast.error('Razorpay checkout script failed to load. Check your internet connection.');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.createPaymentOrder(sessionId);
      if (!res.success) {
        toast.error(res.message || 'Could not create order');
        setProcessing(false);
        return;
      }

      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        name: 'RazorAI Store',
        description: 'Order payment',
        order_id: res.razorpayOrder.id,
        prefill: { name, email },
        theme: { color: '#6D5EF7' },
        handler: async function (response) {
          try {
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              await refreshCart();
              navigate('/order-success', { state: { order: verifyRes.order } });
            } else {
              navigate('/order-success', { state: { failed: true } });
            }
          } catch (err) {
            navigate('/order-success', { state: { failed: true } });
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast('Payment cancelled', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setProcessing(false);
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not initiate payment');
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Secure payment powered by Razorpay (test mode).</p>

      <div className="mt-8 rounded-xl2 border border-black/5 bg-white p-6 shadow-card dark:border-white/5 dark:bg-panel">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Contact details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="rounded-lg border border-black/10 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-accent dark:border-white/10 dark:bg-surface dark:text-white dark:placeholder-slate-500"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="rounded-lg border border-black/10 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-accent dark:border-white/10 dark:bg-surface dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <h2 className="mt-8 font-display text-lg font-semibold text-slate-900 dark:text-white">Order summary</h2>
        <div className="mt-3 flex flex-col gap-2">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatINR(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-black/5 pt-4 font-display text-lg font-bold text-slate-900 dark:border-white/5 dark:text-white">
          <span>Total</span>
          <span>{formatINR(cart.subtotal)}</span>
        </div>

        <button
          onClick={startPayment}
          disabled={processing || cart.items.length === 0}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-accent to-accent-light py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-40"
        >
          {processing ? 'Processing...' : `Pay ${formatINR(cart.subtotal)} with Razorpay`}
        </button>
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
          Test mode — use card 4111 1111 1111 1111, any future expiry, any CVV.
        </p>
      </div>
    </div>
  );
}
