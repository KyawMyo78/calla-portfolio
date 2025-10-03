"use client";

import { useState, createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import PublicChatBubble from './PublicChatBubble';

// Create context for chat state
interface ChatContextType {
  showInNav: boolean;
  setShowInNav: (show: boolean) => void;
  reopenChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  showInNav: false,
  setShowInNav: () => {},
  reopenChat: () => {},
});

export const useChatContext = () => useContext(ChatContext);

// Context provider that wraps the entire app
export function ChatProvider({ children }: { children: ReactNode }) {
  const [showInNav, setShowInNav] = useState(false);
  const [forceReopen, setForceReopen] = useState(0);
  const pathname = usePathname();

  const reopenChat = () => {
    // Simply reset state and force re-render
    setShowInNav(false);
    // Force re-render of PublicChatBubble
    setForceReopen(prev => prev + 1);
  };

  // Hide chat bubble on ALL admin pages (only show on public pages)
  const shouldHideChat = pathname?.startsWith('/admin');

  return (
    <ChatContext.Provider value={{ showInNav, setShowInNav, reopenChat }}>
      {children}
      {!shouldHideChat && (
        <PublicChatBubble 
          key={forceReopen} 
          onMinimizedChange={setShowInNav} 
        />
      )}
    </ChatContext.Provider>
  );
}

// Wrapper component for backward compatibility
export default function PublicChatWrapper() {
  return null; // Context provider is now in layout
}
