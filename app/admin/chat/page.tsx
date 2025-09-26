'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PlusCircle, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'admin_chat_chats_v1';

export default function AdminChatPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Array<{ id: string; title: string; messages: Array<{ role: string; text: string }> }>>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');

  // Ensure there's at least one chat on load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setChats(parsed);
        if (parsed.length > 0) setActiveChatId(parsed[0].id);
        return;
      }
    } catch (e) {
      // ignore
    }
    // create default chat
    const id = `chat_${Date.now()}`;
    const initial = {
      id,
      title: 'New Chat',
      messages: [{ role: 'assistant', text: "Hi — I'm the admin assistant. Ask me about managing Profile, Projects, Blog, and Site Settings." }]
    };
    setChats([initial]);
    setActiveChatId(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      // ignore
    }
  }, [chats]);
  // no status needed; we only support Gemini

  const send = async () => {
    if (!query.trim() || !activeChatId) return;
    setLoading(true);
    const userMsg = { role: 'user', text: query };
    setChats((prev) => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMsg] } : c));
    setQuery('');

    try {
      const activeChat = chats.find(c => c.id === activeChatId);
      const history = activeChat?.messages || [];
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history, chatId: activeChatId }),
      });
      const body = await res.json();
      if (body?.success && body?.reply) {
        setChats((prev) => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, { role: 'assistant', text: body.reply }] } : c));
        // adopt server-provided chatId if returned (server may create chat)
        if (body?.chatId && activeChatId && body.chatId !== activeChatId) {
          setChats((prev) => prev.map(c => c.id === activeChatId ? { ...c, id: body.chatId } : c));
          setActiveChatId(body.chatId);
        }
      } else {
        setChats((prev) => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, { role: 'assistant', text: 'Sorry, I could not get an answer right now.' }] } : c));
      }
    } catch (e) {
      setChats((prev) => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, { role: 'assistant', text: 'Error contacting chat API.' }] } : c));
    } finally {
      setLoading(false);
    }
  };

  // no status fetch required

  return (
    <div className="flex bg-white rounded-lg shadow overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Chats</h3>
          <button
            className="text-clover-700 hover:text-clover-900"
            onClick={() => {
              const id = `chat_${Date.now()}`;
              const newChat = { id, title: 'New Chat', messages: [{ role: 'assistant', text: "Hi — I'm the admin assistant. Ask me about managing Profile, Projects, Blog, and Site Settings." }] };
              setChats(prev => [newChat, ...prev]);
              setActiveChatId(id);
            }}
            title="New chat"
          >
            <PlusCircle />
          </button>
        </div>
        <div className="space-y-2">
          {chats.map(c => (
            <div key={c.id} className={`p-2 rounded cursor-pointer flex items-center justify-between ${c.id === activeChatId ? 'bg-white shadow' : 'hover:bg-white'}`} onClick={() => setActiveChatId(c.id)}>
              <div>
                {editingTitleId === c.id ? (
                  <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} onBlur={async () => {
                    // save title locally
                    setChats(prev => prev.map(x => x.id === c.id ? { ...x, title: titleInput || 'Untitled' } : x));
                    setEditingTitleId(null);
                    // persist to server if chat has server id
                    try {
                      const res = await fetch('/api/admin/chat', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId: c.id, title: titleInput }) });
                      const body = await res.json();
                      if (body?.success && body?.chatId && body?.title) {
                        // update if server returned different id (unlikely)
                        setChats(prev => prev.map(x => x.id === c.id ? { ...x, id: body.chatId, title: body.title } : x));
                        if (activeChatId === c.id) setActiveChatId(body.chatId);
                      }
                    } catch (e) {
                      // ignore
                    }
                  }} autoFocus className="border px-2 py-1 rounded" />
                ) : (
                  <div className="font-medium cursor-text" onClick={() => { setEditingTitleId(c.id); setTitleInput(c.title); }}>{c.title}</div>
                )}
                <div className="text-xs text-gray-500">{c.messages.length} messages</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setChats(prev => prev.filter(x => x.id !== c.id)); if (activeChatId === c.id) setActiveChatId(prev => { const first = chats.find(x => x.id !== c.id); return first ? first.id : null; }); }} className="text-red-500 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare />
          <h2 className="text-lg font-semibold">AI Admin Chat</h2>
        </div>

        <div className="mb-4">
          <div className="border rounded p-3 max-h-72 overflow-auto bg-gray-50">
            {(chats.find(c => c.id === activeChatId)?.messages || []).map((m, idx) => (
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
            placeholder="Ask the admin assistant"
            className="flex-1 border rounded px-3 py-2"
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          />
          <button onClick={send} disabled={loading} className="btn-primary">
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
