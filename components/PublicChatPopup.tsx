"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Minimize2 } from 'lucide-react';
import { checkClientRateLimit, incrementClientRateLimit, getRemainingRequests } from '../lib/rate-limiter';

type Message = { role: "user" | "assistant"; text: string; loading?: boolean };

const QUICK_ACTIONS = [
  "What are your main skills?",
  "Tell me about your recent projects",
  "What's your professional background?",
  "How can I contact you?",
  "What services do you offer?"
];

const STORAGE_KEY = 'publicChatMessages';
const MINIMIZED_KEY = 'publicChatMinimized';

interface PublicChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  mascot?: string;
}

export default function PublicChatPopup({ isOpen, onClose, onMinimize, mascot = "/apclover.jpg" }: PublicChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(10);
  const [resetAt, setResetAt] = useState(Date.now());
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(true);
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      } else {
        // Welcome message for first-time visitors
        setMessages([{
          role: "assistant",
          text: "Hello! I'm AP's Clover, here to help you learn about this portfolio and answer any questions you have. How can I assist you today? 😊"
        }]);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }

    // Load rate limit info
    const { remaining: rem, resetAt: reset } = getRemainingRequests();
    setRemaining(rem);
    setResetAt(reset);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // Detect screen size
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = (ev?: MediaQueryListEvent) => setIsLargeScreen(ev ? ev.matches : mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  async function send() {
    if (!text.trim() || loading) return;

    // Check rate limit before sending
    const rateLimitCheck = checkClientRateLimit();
    if (!rateLimitCheck.allowed) {
      const resetDate = new Date(rateLimitCheck.resetAt);
      setMessages(m => [...m, {
        role: "assistant",
        text: `You've reached your daily message limit (10 messages). The chat will reset on ${resetDate.toLocaleDateString()} at ${resetDate.toLocaleTimeString()}. Feel free to contact me directly via the contact form! 📬`
      }]);
      return;
    }

    const prompt = text.trim();
    const userMsg: Message = { role: "user", text: prompt };
    setMessages(m => [...m, userMsg]);
    setText("");
    setLoading(true);

    // Add loading message
    const loadingMsg: Message = { role: "assistant", text: "", loading: true };
    setMessages(m => [...m, loadingMsg]);

    try {
      // Send request
      const recentHistory = messages.slice(-10).map(m => ({
        role: m.role,
        text: m.text
      }));
      
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          chatHistory: recentHistory
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle rate limit or error
        const errorMsg = data?.message || data?.error || "Failed to get response";
        setMessages(m => {
          const copy = [...m];
          const lastLoadingIndex = copy.map(x => x.loading).lastIndexOf(true);
          if (lastLoadingIndex >= 0) {
            copy[lastLoadingIndex] = { role: "assistant", text: errorMsg };
          } else {
            copy.push({ role: "assistant", text: errorMsg });
          }
          return copy;
        });
        
        if (res.status === 429) {
          setRemaining(0);
          setResetAt(data.resetAt || Date.now());
        }
        return;
      }

      // Success - increment rate limit and update remaining
      incrementClientRateLimit();
      if (data.remaining !== undefined) setRemaining(data.remaining);
      if (data.resetAt) setResetAt(data.resetAt);

      const reply = data?.reply || "(no reply)";
      setMessages(m => {
        const copy = [...m];
        const lastLoadingIndex = copy.map(x => x.loading).lastIndexOf(true);
        if (lastLoadingIndex >= 0) {
          copy[lastLoadingIndex] = { role: "assistant", text: reply };
        } else {
          copy.push({ role: "assistant", text: reply });
        }
        return copy;
      });

    } catch (err: any) {
      const msg = `Network error: ${err?.message || String(err)}`;
      setMessages(m => {
        const copy = [...m];
        const lastLoadingIndex = copy.map(x => x.loading).lastIndexOf(true);
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Popup Window */}
      <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50 max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[600px] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={mascot} alt="AP Clover" className="w-12 h-12 rounded-full border-2 border-white/30 object-cover" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">AP's Clover</h3>
              <p className="text-xs text-primary-100">Portfolio Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onMinimize}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rate Limit Info */}
        {remaining <= 3 && remaining > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800">
            ⚠️ {remaining} message{remaining !== 1 ? 's' : ''} remaining today
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.length === 1 && messages[0].role === 'assistant' && (
            <div className="space-y-4">
              {/* Initial message */}
              <div className="flex items-end space-x-2">
                <img src={mascot} alt="AP Clover" className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-gray-200" />
                <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md shadow-sm border border-gray-200 max-w-[80%]">
                  <div className="text-sm prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{messages[0].text}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="space-y-2 mt-4">
                <p className="text-gray-600 font-medium text-xs px-2">Quick questions:</p>
                <div className="grid gap-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => setText(action)}
                      disabled={loading}
                      className="text-left p-3 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl text-sm text-gray-900 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-primary-600 mr-2">💬</span>
                      <span className="text-gray-900">{action}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.length > 1 && messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end space-x-2 max-w-[85%] ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                {m.role === "assistant" && (
                  <img src={mascot} alt="AP Clover" className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-gray-200" />
                )}
                
                <div className={`px-4 py-3 rounded-2xl ${
                  m.role === "user" 
                    ? "bg-primary-600 text-white rounded-br-md shadow-lg" 
                    : "bg-gray-100 text-gray-900 rounded-bl-md shadow-sm border border-gray-200"
                }`}>
                  <div className="text-sm">
                    {m.loading ? (
                      <div className="flex items-center space-x-2 py-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-primary-600 text-xs font-medium">Thinking...</span>
                      </div>
                    ) : (
                      m.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-white">{m.text}</div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  autoResize();
                }}
                placeholder="Type your message..."
                className="w-full resize-none border-2 border-gray-300 rounded-2xl px-4 py-3 focus:border-primary-500 focus:outline-none transition-colors bg-white shadow-sm text-sm text-gray-900"
                disabled={loading || remaining === 0}
                rows={1}
                onInput={autoResize}
                onKeyDown={(e) => {
                  if (isLargeScreen && e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
            </div>
            <button 
              onClick={send} 
              className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                loading || !text.trim() || remaining === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
              disabled={loading || !text.trim() || remaining === 0}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {remaining > 0 ? `${remaining} messages remaining today` : 'Daily limit reached. Resets at ' + new Date(resetAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </>
  );
}
