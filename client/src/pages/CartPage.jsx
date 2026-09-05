import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/session';

export default function CartPage() {
  const { cart, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Your Cart</h1>

      {cart.items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-slate-500 dark:text-slate-400">Your cart is empty.</p>
          <Link
            to="/ai-shopping"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Ask the AI Assistant
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 flex flex-col gap-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-4 rounded-xl2 border border-black/5 bg-white p-4 shadow-card dark:border-white/5 dark:bg-panel"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                  {item.source !== 'manual' && (
                    <span className="mt-1 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent-dark dark:text-accent-light">
                      Added via AI · {item.source.replace('_', '-')}
                    </span>
                  )}
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatINR(item.price)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 px-2 py-1 dark:border-white/10">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="text-slate-600 dark:text-slate-300"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm text-slate-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="text-slate-600 dark:text-slate-300"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-20 text-right font-semibold text-slate-900 dark:text-white">{formatINR(item.lineTotal)}</span>
                  <button onClick={() => removeItem(item.productId, item.name)} className="text-coral text-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-xl2 border border-black/5 bg-white p-6 shadow-card dark:border-white/5 dark:bg-panel">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Items ({cart.itemCount})</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-black/5 pt-3 font-semibold text-slate-900 dark:border-white/5 dark:text-white">
              <span>Total</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-accent to-accent-light py-3 text-sm font-semibold text-white shadow-glow"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
