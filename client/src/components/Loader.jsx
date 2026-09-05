import React from 'react';

export function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-accent dark:border-white/10" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-black/5 bg-white px-4 py-3 w-fit dark:border-transparent dark:bg-panel">
      <span className="typing-dot h-2 w-2 rounded-full bg-accent-light" />
      <span className="typing-dot h-2 w-2 rounded-full bg-accent-light" />
      <span className="typing-dot h-2 w-2 rounded-full bg-accent-light" />
    </div>
  );
}
