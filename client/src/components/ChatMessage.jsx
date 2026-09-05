import React from 'react';
import ProductCard from './ProductCard.jsx';

// Pulls actual product objects out of the tool-call results the agent executed,
// so the UI only ever shows real DB-backed products (never hallucinated ones).
export function extractProductsFromToolCalls(toolCalls = []) {
  const grouped = { primary: [], upsell: [], cross_sell: [] };
  const seen = new Set();

  const pushUnique = (bucket, product, reason) => {
    if (!product || !product._id) return;
    const key = `${bucket}-${product._id}`;
    if (seen.has(product._id)) return;
    seen.add(product._id);
    grouped[bucket].push({ product, reason });
  };

  toolCalls.forEach((call) => {
    const r = call.result || {};
    if (call.name === 'searchProducts' && Array.isArray(r.products)) {
      r.products.forEach((p) => pushUnique('primary', p));
    }
    if (call.name === 'recommendProducts' && Array.isArray(r.recommended)) {
      r.recommended.forEach((p) => pushUnique('primary', p, 'AI-recommended best match'));
    }
    if (call.name === 'suggestUpsell' && Array.isArray(r.upsells)) {
      r.upsells.forEach((p) => pushUnique('upsell', p, 'A higher-tier upgrade'));
    }
    if (call.name === 'suggestCrossSell' && Array.isArray(r.crossSells)) {
      r.crossSells.forEach((p) => pushUnique('cross_sell', p, 'Frequently bought together'));
    }
  });

  return grouped;
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const grouped = !isUser ? extractProductsFromToolCalls(message.toolCalls) : { primary: [], upsell: [], cross_sell: [] };
  const hasProducts = grouped.primary.length > 0 || grouped.upsell.length > 0 || grouped.cross_sell.length > 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-accent text-white'
              : 'bg-white text-slate-900 border border-black/5 dark:bg-panel dark:text-slate-100 dark:border-white/5'
          }`}
        >
          {message.content}
        </div>

        {!isUser && hasProducts && (
          <div className="mt-3 flex flex-col gap-4">
            {grouped.primary.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended for you</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {grouped.primary.map(({ product, reason }) => (
                    <ProductCard key={product._id} product={product} reason={reason} badge="Best Match" />
                  ))}
                </div>
              </div>
            )}
            {grouped.upsell.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Upgrade option</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {grouped.upsell.map(({ product, reason }) => (
                    <ProductCard key={product._id} product={product} reason={reason} badge="Upsell" />
                  ))}
                </div>
              </div>
            )}
            {grouped.cross_sell.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Goes well with it</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {grouped.cross_sell.map(({ product, reason }) => (
                    <ProductCard key={product._id} product={product} reason={reason} badge="Cross-sell" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
