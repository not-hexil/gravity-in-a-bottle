'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const STARTER_PROMPTS = [
  'What happened to Beagle 2 on Mars?',
  'Where is the Philae comet lander?',
  'How long did Venera 13 survive on Venus?',
];

export default function ArchiveBotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'ODYSSEY-6 ARCHIVE AI ONLINE. Query any lost lander, rover, or deep-space probe.',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendQuery = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', text: trimmed },
    ];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/archive-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Skip the initial local greeting so history starts with a user message
          messages: nextMessages.slice(1),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Uplink failure');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', text: data.reply },
      ]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'ARCHIVE UPLINK INTERRUPTED.';
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `⚠ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-mono">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-slate-950/95 px-3.5 py-2 text-xs font-bold tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)] transition hover:border-amber-400 hover:text-amber-300 cursor-pointer"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ASK ARCHIVE AI</span>
        </button>
      ) : (
        <div className="flex h-[26rem] w-[21rem] sm:w-[25rem] flex-col overflow-hidden rounded-xl border border-cyan-500/50 bg-slate-950/95 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-cyan-300">
                ARCHIVE TELEMETRY Q&A
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              aria-label="Minimize Archive AI"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-3.5 text-xs leading-relaxed"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-lg px-3 py-2 ${
                  m.role === 'user'
                    ? 'ml-6 border border-amber-500/40 bg-amber-500/10 text-amber-200'
                    : 'mr-4 border border-slate-800 bg-slate-900/90 text-slate-200'
                }`}
              >
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {m.role === 'user' ? 'CREW QUERY' : 'ODYSSEY-6 ARCHIVE'}
                </span>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}

            {loading && (
              <div className="mr-4 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-cyan-300 animate-pulse">
                SCANNING DEEP-SPACE ARCHIVES...
              </div>
            )}
          </div>

          {/* Quick Starter Chips */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-800/80 bg-slate-900/60 px-3 py-2">
              {STARTER_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuery(q)}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-800 bg-slate-900 p-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a lost probe..."
              disabled={loading}
              className="flex-1 rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-40 cursor-pointer"
            >
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
