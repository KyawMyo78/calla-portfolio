"use client";

import React, { useState, useEffect, useRef } from "react";

type Message = { role: "user" | "assistant"; text: string; loading?: boolean };

export default function ChatUI({
  initialPrompt = "",
  initialAiReply = "",
  mascot = "/apclover.jpg",
}: {
  initialPrompt?: string;
  initialAiReply?: string;
  mascot?: string;
}) {
  // simple inline styles for the loading dots (keeps this component self-contained)
  const dotsStyle = (
    <style>{`
      .loading-dots .dot{ display:inline-block; width:6px; height:6px; margin:0 2px; border-radius:50%; background:currentColor; opacity:0; transform:translateY(0);
        animation: loading-dot 1s infinite linear; }
      .loading-dots .dot:nth-child(1){ animation-delay:0s }
      .loading-dots .dot:nth-child(2){ animation-delay:0.15s }
      .loading-dots .dot:nth-child(3){ animation-delay:0.3s }
      @keyframes loading-dot{ 0%{opacity:0; transform:translateY(-2px)} 50%{opacity:1; transform:translateY(0)} 100%{opacity:0; transform:translateY(2px)} }
    `}</style>
  );
  const [messages, setMessages] = useState<Message[]>(() => {
    const msgs: Message[] = [];
    if (initialAiReply) msgs.push({ role: "assistant", text: initialAiReply });
    return msgs;
  });
  const [text, setText] = useState(initialPrompt || "");
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = (ev?: MediaQueryListEvent) => setIsLargeScreen(ev ? ev.matches : mq.matches);
    update();
    try {
      mq.addEventListener?.("change", update);
    } catch (e) {
      // Safari older engines
      (mq as any).addListener?.(update);
    }
    return () => {
      try {
        mq.removeEventListener?.("change", update);
      } catch (e) {
        (mq as any).removeListener?.(update);
      }
    };
  }, []);

  async function send() {
    if (!text.trim()) return;
    const prompt = text.trim();
    const userMsg: Message = { role: "user", text: prompt };
    setMessages((m) => [...m, userMsg]);
    setText("");
    setLoading(true);

    // Add a temporary loading bubble from assistant
    const loadingMsg: Message = { role: "assistant", text: "", loading: true };
    setMessages((m) => [...m, loadingMsg]);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const textBody = await res.text();
      if (!res.ok) {
        // Try parse JSON error if possible
        let errMsg = textBody;
        try {
          const parsed = JSON.parse(textBody);
          errMsg = parsed?.error || JSON.stringify(parsed);
        } catch (e) {
          // keep textBody
        }
        const aiMsg: Message = { role: "assistant", text: `Error from server: ${errMsg}` };
        setMessages((m) => [...m, aiMsg]);
        return;
      }

      const data = JSON.parse(textBody);
      const reply: string = data?.reply || data?.text || "(no reply)";
      // Replace the last loading message with the real reply
      setMessages((m) => {
        const copy = [...m];
        const lastLoadingIndex = copy.map((x) => x.loading).lastIndexOf(true);
        if (lastLoadingIndex >= 0) {
          copy[lastLoadingIndex] = { role: "assistant", text: reply };
        } else {
          copy.push({ role: "assistant", text: reply });
        }
        return copy;
      });
    } catch (err: any) {
      const msg = `Network error: ${err?.message || String(err)}`;
      setMessages((m) => {
        const copy = [...m];
        const lastLoadingIndex = copy.map((x) => x.loading).lastIndexOf(true);
        if (lastLoadingIndex >= 0) {
          copy[lastLoadingIndex] = { role: "assistant", text: msg };
        } else {
          copy.push({ role: "assistant", text: msg });
        }
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  const [loading, setLoading] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {dotsStyle}
      <div>
        <div className="w-full p-6">
          <div className="flex items-center gap-4">
            <img src={mascot} alt="AP Clover" className="w-16 h-16 rounded-full shadow-md object-cover" />
            <div>
              <h2 className="text-xl font-bold">AP 's Clover</h2>
              <p className="text-sm text-gray-500">Your friendly portfolio assistant</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-gray-500">No messages yet. Try asking something!</div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="flex" style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  className={`p-4 rounded-lg max-w-[80%] ${
                    m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {m.loading ? (
                      <span className="loading-dots inline-block align-middle">
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                      </span>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask AP 's Clover..."
              className="flex-1 border rounded-lg p-3 resize-none min-h-[48px] max-h-48"
              disabled={loading}
              onKeyDown={(e) => {
                // Large screens: Enter sends (unless Shift held). Shift+Enter => newline.
                // Small screens: Enter inserts newline; sending must be done via Send button.
                if (isLargeScreen) {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                  // otherwise allow default (Shift+Enter -> newline)
                } else {
                  // Small screens: Enter should insert newline (default behavior). Optionally,
                  // we could support Ctrl+Enter to send, but per request, only Send button sends.
                }
              }}
            />
            <button onClick={send} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50" disabled={loading || !text.trim()}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
          {loading && <div className="text-sm text-gray-500 mt-2">AP Clover is thinking...</div>}
        </div>

      </div>
    </div>
  );
}
