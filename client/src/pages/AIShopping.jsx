import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChatMessage, { extractProductsFromToolCalls } from '../components/ChatMessage.jsx';
import { TypingIndicator } from '../components/Loader.jsx';
import { useCart } from '../context/CartContext.jsx';
import * as api from '../services/api';

const SUGGESTIONS = [
  'I need a laptop for coding under ₹60,000',
  'Suggest a gaming laptop under ₹80,000 with accessories',
  'Best budget smartphone under ₹20,000',
  "What's in my cart right now?",
];

export default function AIShopping() {
  const { sessionId, addItem, refreshCart } = useCart();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api
      .fetchChatHistory(sessionId)
      .then((res) => {
        if (res.messages?.length) setMessages(res.messages);
        else {
          setMessages([
            {
              role: 'assistant',
              content:
                "Hi! I'm RazorAI, your shopping assistant. Tell me what you're looking for — a category, budget, and use case — and I'll find the best match for you.",
              toolCalls: [],
            },
          ]);
        }
      })
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text) => {
    const messageText = (text ?? input).trim();
    if (!messageText || sending) return;

    setMessages((prev) => [...prev, { role: 'user', content: messageText, toolCalls: [] }]);
    setInput('');
    setSending(true);

    try {
      const res = await api.sendChatMessage(sessionId, messageText);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, toolCalls: res.toolCalls }]);
      // Refresh cart in case the agent called addToCart
      const addedToCart = (res.toolCalls || []).some((c) => c.name === 'addToCart' && c.result?.success);
      if (addedToCart) refreshCart();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'The AI assistant is currently unavailable. Please check the server configuration.';
      setMessages((prev) => [...prev, { role: 'assistant', content: msg, toolCalls: [] }]);
      toast.error('AI request failed');
    } finally {
      setSending(false);
    }
  };

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const grouped = lastAssistantMsg ? extractProductsFromToolCalls(lastAssistantMsg.toolCalls) : {};
  const allSuggested = [...(grouped.primary || []), ...(grouped.upsell || []), ...(grouped.cross_sell || [])];

  const addAllRecommended = async () => {
    for (const { product } of allSuggested) {
      const source = grouped.upsell?.some((u) => u.product._id === product._id)
        ? 'upsell'
        : grouped.cross_sell?.some((c) => c.product._id === product._id)
        ? 'cross_sell'
        : 'ai_recommendation';
      // eslint-disable-next-line no-await-in-loop
      await addItem(product._id, 1, source, product.name);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-73px)] max-w-5xl flex-col px-6 py-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">AI Shopping Assistant</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Describe what you need — I'll search, recommend, and build your cart.</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {messages.map((m, idx) => (
          <ChatMessage key={idx} message={m} />
        ))}
        {sending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {allSuggested.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-black/5 pt-3 dark:border-white/5">
          <button
            onClick={addAllRecommended}
            className="rounded-lg bg-mint px-4 py-2 text-xs font-semibold text-ink hover:bg-mint/90"
          >
            Add Recommended Items
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:border-accent/50 dark:border-white/10 dark:bg-panel dark:text-white"
          >
            View Cart
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="rounded-lg bg-gradient-to-r from-accent to-accent-light px-4 py-2 text-xs font-semibold text-white"
          >
            Checkout
          </button>
        </div>
      )}

      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-accent/50 hover:text-slate-900 dark:border-white/10 dark:bg-panel dark:text-slate-300 dark:hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex items-center gap-3 rounded-xl2 border border-black/10 bg-white p-2 shadow-card dark:border-white/10 dark:bg-panel"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I need a laptop for coding under ₹60,000"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
