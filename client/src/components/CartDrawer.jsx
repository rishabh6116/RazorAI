import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/session';

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-fade-in dark:bg-surface">
        <div className="flex items-center justify-between border-b border-black/5 p-5 dark:border-white/5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Your Cart</h2>
          <button onClick={() => setDrawerOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">Your cart is empty.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-3 rounded-xl border border-black/5 bg-slate-50 p-3 dark:border-white/5 dark:bg-panel">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                    {item.source !== 'manual' && (
                      <span className="mt-1 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent-dark dark:text-accent-light">
                        AI {item.source.replace('_', '-')}
                      </span>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="h-6 w-6 rounded-md bg-black/5 text-slate-900 dark:bg-white/10 dark:text-white"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{item.quantity}</span>
                      <button
                        className="h-6 w-6 rounded-md bg-black/5 text-slate-900 dark:bg-white/10 dark:text-white"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatINR(item.lineTotal)}</span>
                    <button
                      onClick={() => removeItem(item.productId, item.name)}
                      className="text-xs text-coral hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-black/5 p-5 dark:border-white/5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="font-display text-xl font-bold text-slate-900 dark:text-white">{formatINR(cart.subtotal)}</span>
          </div>
          <button
            disabled={cart.items.length === 0}
            onClick={() => {
              setDrawerOpen(false);
              navigate('/checkout');
            }}
            className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-light py-3 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
