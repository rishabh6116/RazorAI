import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Understands Intent',
    desc: 'Extracts category, budget, and use-case from natural language — no filters needed.',
    icon: '🧠',
  },
  {
    title: 'Agentic Recommendations',
    desc: 'Calls real tools to search, compare, and recommend products from live inventory.',
    icon: '⚡',
  },
  {
    title: 'Smart Upsell & Cross-sell',
    desc: 'Suggests complementary accessories automatically, boosting average order value.',
    icon: '📈',
  },
  {
    title: 'Secure Razorpay Checkout',
    desc: 'Server-verified payments with signature checks — never trusting client-sent data.',
    icon: '🔒',
  },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-medium text-accent-dark dark:text-accent-light">
            Razorpay AI Builder Internship 2026 · Track 1
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl">
            The AI shopping agent that <span className="text-accent-dark dark:text-accent-light">grows your revenue</span> while it chats.
          </h1>
          <p className="mt-5 text-base text-slate-500 dark:text-slate-400">
            RazorAI understands what a customer needs, finds the best matching products, intelligently
            upsells and cross-sells, builds their cart, and takes them to a secure Razorpay checkout —
            all in one conversation.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/ai-shopping"
              className="rounded-xl bg-gradient-to-r from-accent to-accent-light px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              Try the AI Assistant
            </Link>
            <Link
              to="/shop"
              className="rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-accent/50 dark:border-white/10 dark:bg-panel dark:text-white"
            >
              Browse Products
            </Link>
          </div>
        </div>

        <div className="rounded-xl2 border border-black/5 bg-white p-6 shadow-card dark:border-white/5 dark:bg-panel">
          <div className="flex items-center gap-2 border-b border-black/5 pb-4 dark:border-white/5">
            <div className="h-2.5 w-2.5 rounded-full bg-coral" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-mint" />
            <span className="ml-2 text-xs text-slate-500">AI Shopping Assistant</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div className="max-w-[85%] rounded-2xl bg-accent px-4 py-2 text-white self-end ml-auto">
              I need a laptop for coding under ₹60,000.
            </div>
            <div className="max-w-[90%] rounded-2xl border border-black/5 bg-slate-50 px-4 py-3 text-slate-700 dark:border-white/5 dark:bg-surface dark:text-slate-200">
              I found 4 laptops matching your requirements. Based on programming performance and value,
              I recommend <span className="font-medium text-accent-dark dark:text-accent-light">ASUS Vivobook Pro Dev</span> at ₹61,990.
              <br />
              <br />
              You may also want:
              <br />• Wireless Mouse – ₹999
              <br />• Laptop Stand – ₹1,299
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {['View Laptop', 'Add Recommended Items', 'Compare', 'Checkout'].map((btn) => (
                <span key={btn} className="rounded-lg border border-black/10 bg-black/5 px-3 py-1.5 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {btn}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl2 border border-black/5 bg-white p-6 shadow-card dark:border-white/5 dark:bg-panel">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-24 rounded-xl2 border border-black/5 bg-gradient-to-br from-white to-slate-50 p-10 text-center shadow-card dark:border-white/5 dark:from-panel dark:to-surface">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Built for merchants who want growth, not just chat.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Every conversation is tracked. Every recommendation is measured. The Merchant Dashboard shows
          exactly how much extra revenue the AI agent generates through upsells and cross-sells.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-xl border border-mint/40 bg-mint/10 px-6 py-3 text-sm font-semibold text-mint transition hover:bg-mint/20"
        >
          View Growth Dashboard
        </Link>
      </div>
    </div>
  );
}
