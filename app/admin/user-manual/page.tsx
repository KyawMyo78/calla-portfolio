"use client";

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function AdminUserManualPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    { role: 'system', text: 'You are the admin assistant for the portfolio site. Answer questions about using the admin panel and site features.' },
  ]);
  const [status, setStatus] = useState<{ gemini?: boolean } | null>(null);

  const send = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', text: query };
    setMessages((m) => [...m, userMsg]);
    setQuery('');

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const body = await res.json();
      if (body?.success && body?.reply) {
        setMessages((m) => [...m, { role: 'assistant', text: body.reply }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, I could not get an answer right now.' }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error contacting chat API.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/chat/status');
        const j = await res.json();
        if (mounted && j?.success) setStatus({ gemini: !!j.gemini });
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <BookOpen />
        <h2 className="text-lg font-semibold">User Manual & AI Assistant</h2>
        <div className="ml-auto text-sm text-gray-600">
            {status ? (
              status.gemini ? <span className="text-green-600">Gemini configured</span> : <span className="text-gray-400">Gemini not configured</span>
            ) : (
              <span className="text-gray-400">Checking key...</span>
            )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium">Quick Start</h3>
        <ol className="list-decimal list-inside ml-4 text-sm text-gray-700 mt-2">
          <li>Use the navigation to manage Profile, Projects, Experience, Skills, Blog and Site Settings.</li>
          <li>Toggle visibility for public pages using the "Visible" button in the header (per-page).</li>
          <li>Upload profile image in Profile page. Use the CV field to provide a download link.
          </li>
          <li>Manage blog posts under Blog &gt; New.</li>
        </ol>
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Ask the admin assistant</h3>
        <div className="border rounded p-3 max-h-64 overflow-auto bg-gray-50">
          {messages.filter(m => m.role !== 'system').map((m, idx) => (
            <div key={idx} className={`py-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block rounded px-3 py-1 ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about admin tasks, e.g. 'How do I add a new project?'"
          className="flex-1 border rounded px-3 py-2"
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button onClick={send} disabled={loading} className="btn-primary">
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <strong>Note:</strong> The assistant uses Gemini. Configure `GEMINI_API_KEY` in your server environment to enable live responses. Without the key the assistant returns canned answers.
      </div>
    </div>
  );
}
