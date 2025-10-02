# Public Chat Feature - Setup Guide

## Overview

The public-facing AI chat feature allows website visitors to interact with AP's Clover, an AI assistant that represents you (the portfolio owner). This is separate from the admin chat and has its own API key and rate limiting.

## Features

✅ **Separate AI Identity**: Uses a dedicated Gemini API key for public visitors
✅ **Rate Limiting**: 10 messages per visitor per day (tracked via localStorage + IP)
✅ **Persistent Chat**: Messages persist until page reload
✅ **Messenger-Style UI**: Floating chat bubble with popup window
✅ **Minimize to Navbar**: Close button moves chat icon to navigation bar
✅ **Mobile Responsive**: Works seamlessly on all screen sizes
✅ **Professional Tone**: Casual-professional personality representing the admin

## Setup Instructions

### 1. Get a Gemini API Key for Public Use

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key (or use a separate one from your admin key)
3. This key will be used for public visitor chats

### 2. Add the API Key to Environment Variables

#### Local Development (.env.local)
```bash
# Public chat (for website visitors)
GEMINI_PUBLIC_API_KEY=your_actual_api_key_here
```

#### Production (Vercel)
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add new variable:
   - Name: `GEMINI_PUBLIC_API_KEY`
   - Value: Your Gemini API key
   - Environment: Production (and Preview if needed)
4. Redeploy your site

### 3. Test the Feature

1. Visit your website homepage
2. You should see a floating chat bubble in the bottom-right corner
3. Click the bubble to open the chat
4. Try sending a message

## How It Works

### Components

1. **PublicChatBubble.tsx** - Floating chat bubble with close button
2. **PublicChatPopup.tsx** - Messenger-style chat window
3. **PublicChatWrapper.tsx** - Manages state and visibility
4. **Navigation.tsx** - Shows chat icon when minimized

### API Route

**Endpoint**: `/api/public/chat`
- Uses `GEMINI_PUBLIC_API_KEY`
- Rate limits: 10 messages per visitor per day
- Fetches public portfolio data (projects, skills, experience, blog posts)
- Responds as the portfolio owner's representative

### Rate Limiting

**Client-side**:
- Stored in localStorage: `publicChatRateLimit`
- Tracks message count and reset time
- Resets every 24 hours

**Server-side**:
- In-memory Map (IP-based)
- Backup validation in case client-side is bypassed
- Auto-cleanup of expired entries

### State Management

**localStorage Keys**:
- `publicChatMessages` - Persists chat history
- `publicChatMinimized` - Tracks if chat is minimized
- `publicChatBubbleClosed` - Tracks if bubble is closed (moved to navbar)
- `publicChatRateLimit` - Rate limit data

## UI Behavior

### Chat Bubble States

1. **Visible** (default)
   - Floating bubble in bottom-right
   - Click to open chat
   - Has small "×" close button on hover

2. **Closed** (when × is clicked)
   - Bubble disappears
   - Chat icon appears in navbar
   - Click navbar icon to reopen

3. **Chat Open**
   - Popup window appears
   - Can minimize (→ bubble) or close (→ navbar)
   - Messages persist

## Customization

### System Prompt

Edit the `PUBLIC_SYSTEM_PROMPT` in `/app/api/public/chat/route.ts` to change:
- AI personality
- Communication style
- What it can/cannot discuss
- Navigation guidance

### Rate Limits

Change limits in `/lib/rate-limiter.ts`:
```typescript
const MAX_REQUESTS = 10; // Messages per visitor
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
```

### UI Styling

- **Bubble**: Edit `PublicChatBubble.tsx`
- **Popup**: Edit `PublicChatPopup.tsx`
- **Navbar Icon**: Edit `Navigation.tsx`

### Avatar/Mascot

Default: `/apclover.jpg`

To change, update the `mascot` prop in:
- `PublicChatWrapper.tsx`
- Or pass it to `<PublicChatBubble mascot="/your-image.jpg" />`

## Testing Checklist

- [ ] Chat bubble appears on public pages
- [ ] Clicking bubble opens chat popup
- [ ] Messages send and receive responses
- [ ] Rate limiting works (try 10 messages)
- [ ] Chat history persists when closing/reopening
- [ ] Minimize button moves to bubble
- [ ] Close (×) button moves icon to navbar
- [ ] Navbar icon reopens chat
- [ ] Mobile responsive (bubble + popup)
- [ ] Works after page reload (except cleared on refresh)

## Troubleshooting

### Chat bubble doesn't appear
- Check browser console for errors
- Verify `PublicChatWrapper` is in `layout.tsx`
- Check if localStorage is enabled

### API errors (500)
- Verify `GEMINI_PUBLIC_API_KEY` is set correctly
- Check Vercel logs for detailed error messages
- Ensure API key has proper permissions

### Rate limit not working
- Check browser localStorage for `publicChatRateLimit`
- Clear localStorage and test again
- Check server logs for IP-based rate limiting

### Messages don't persist
- Check localStorage for `publicChatMessages`
- Ensure localStorage isn't full
- Try incognito mode to test fresh state

## API Key Security

### Important Notes

1. **Separate Keys**: Use different keys for admin vs public
2. **Rate Limiting**: Essential to prevent abuse
3. **Monitoring**: Check API usage in Google AI Studio
4. **Budget Alerts**: Set up usage alerts if available

### Why Separate Keys?

- Admin key: Unlimited (trusted user)
- Public key: Rate-limited (untrusted visitors)
- Separate billing/monitoring
- Can revoke public key if abused

## Future Enhancements

Potential improvements:
- [ ] IP-based persistent rate limiting (Redis)
- [ ] Admin dashboard for chat analytics
- [ ] Custom responses for common questions
- [ ] Multi-language support
- [ ] Chat history export for visitors
- [ ] Email notifications for admin
- [ ] Sentiment analysis

## Support

If you encounter issues:
1. Check browser console
2. Check Vercel function logs
3. Verify environment variables
4. Test in incognito mode
5. Clear localStorage and retry

---

**Created**: October 2025
**Version**: 1.0.0
