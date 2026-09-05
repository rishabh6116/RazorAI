import React from 'react';
import { formatINR } from '../utils/session';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product, reason, badge }) {
  const { addItem } = useCart();

  if (!product) return null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl2 border border-black/5 bg-white shadow-card transition hover:-translate-y-1 hover:border-accent/40 dark:border-white/5 dark:bg-panel">
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-surface">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-mint/90 px-3 py-1 text-xs font-semibold text-ink">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-slate-900 line-clamp-2 dark:text-white">{product.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-black/5 px-2 py-0.5 text-xs text-amber-500 dark:bg-white/5 dark:text-amber-300">
            ★ {product.rating?.toFixed(1)}
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>

        {product.specs && (
          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            {Object.entries(product.specs)
              .slice(0, 3)
              .map(([k, v]) => (
                <span key={k} className="rounded-md bg-black/5 px-2 py-0.5 dark:bg-white/5">
                  {String(v)}
                </span>
              ))}
          </div>
        )}

        {reason && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent-dark dark:text-accent-light">💡 {reason}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg font-bold text-slate-900 dark:text-white">{formatINR(product.price)}</span>
          <button
            onClick={() => addItem(product._id || product.id, 1, 'manual', product.name)}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-dark"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
