"use client";

import Navigation from './Navigation';
import { useChatContext } from './PublicChatWrapper';

export default function NavigationWithChat({ siteSettings }: { siteSettings?: any }) {
  const { showInNav, reopenChat } = useChatContext();

  return (
    <Navigation 
      siteSettings={siteSettings} 
      showChatIcon={showInNav}
      onChatClick={reopenChat}
    />
  );
}
