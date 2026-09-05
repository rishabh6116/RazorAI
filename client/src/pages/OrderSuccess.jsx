import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatINR } from '../utils/session';

export default function OrderSuccess() {
  const location = useLocation();
  const { order, failed } = location.state || {};

  if (failed || !order) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coral/15 text-3xl">
          ✕
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-slate-900 dark:text-white">Payment Failed</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          We couldn't verify your payment. No amount has been charged if the transaction did not
          complete. Please try again.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/checkout"
            className="rounded-xl bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Retry Payment
          </Link>
          <Link
            to="/cart"
            className="rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-panel dark:text-white"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/15 text-3xl">
        ✓
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your order has been placed and verified securely.</p>

      <div className="mt-8 rounded-xl2 border border-black/5 bg-white p-6 text-left shadow-card dark:border-white/5 dark:bg-panel">
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Order ID</span>
          <span className="text-slate-700 dark:text-slate-200">{order._id}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-black/5 pt-4 font-display text-lg font-bold text-slate-900 dark:border-white/5 dark:text-white">
          <span>Total Paid</span>
          <span>{formatINR(order.total)}</span>
        </div>
        {order.aiRecommendedRevenue > 0 && (
          <p className="mt-4 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent-dark dark:text-accent-light">
            💡 {formatINR(order.aiRecommendedRevenue)} of this order came from AI recommendations,
            upsells, and cross-sells.
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/shop"
          className="rounded-xl bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-white shadow-glow"
        >
          Continue Shopping
        </Link>
        <Link
          to="/dashboard"
          className="rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-panel dark:text-white"
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
