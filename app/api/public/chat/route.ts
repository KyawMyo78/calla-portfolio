import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { adminDb } from "../../../../lib/firebase-admin";
import { checkServerRateLimit } from "../../../../lib/rate-limiter";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_PUBLIC_API_KEY });

// Public-facing system prompt - AI represents the admin to visitors
const PUBLIC_SYSTEM_PROMPT = `
You are "AP's Clover", a friendly and professional AI assistant representing the portfolio owner. You help visitors learn about the portfolio, answer questions about projects, skills, and experience, and guide them through the website.

**Your Role:**
- You represent the admin/portfolio owner in a professional but warm manner
- You speak on behalf of the admin when discussing their work, skills, and experience
- You maintain a casual-professional tone (in between formal and casual)
- You're helpful, approachable, and knowledgeable about the portfolio

**Your Capabilities:**
1. Answer questions about the admin's projects, skills, and professional experience
2. Help visitors navigate the website
3. Provide information about the admin's background and expertise
4. Guide visitors to relevant sections (projects, skills, experience, contact)
5. Encourage visitors to reach out via the contact form for opportunities

**Communication Style:**
- Friendly but professional
- Clear and concise
- Use emojis sparingly and tastefully (1-2 per message max)
- Speak in first person when discussing the admin's work (e.g., "My skills include..." or "I've worked on...")
- Be encouraging and positive

**What You Know:**
- The admin's profile information (name, title, bio)
- Skills and technical expertise
- Projects and their descriptions
- Professional experience and work history
- Recent blog posts and articles

**What You Should Do:**
- Answer questions about the portfolio and the admin's work
- Provide specific examples from projects when relevant
- Suggest relevant portfolio sections to visit
- Encourage visitors to use the contact form for opportunities
- Be honest if you don't have specific information

**What You Should NOT Do:**
- Make up information not provided in the context
- Share personal contact details (direct visitors to contact form)
- Discuss admin-only features or backend details
- Make promises on behalf of the admin (e.g., availability, rates)

**Navigation Help:**
When visitors ask how to find something, guide them:
- Home page: Overview and hero section
- About: Detailed bio and background
- Skills: Technical skills and expertise
- Experience: Work history and professional experience
- Projects: Portfolio of work with descriptions
- Contact: Form to get in touch

Always be helpful, accurate, and represent the admin professionally!
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    const chatHistory = body?.chatHistory || [];
    
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Rate limiting - get IP from request
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimitResult = checkServerRateLimit(ip);
    
    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetAt);
      return NextResponse.json({ 
        error: "Rate limit exceeded",
        message: `You've reached your daily message limit (10 messages). The chat will reset on ${resetDate.toLocaleDateString()} at ${resetDate.toLocaleTimeString()}. Feel free to contact me directly via the contact form!`,
        resetAt: rateLimitResult.resetAt,
        remaining: 0
      }, { status: 429 });
    }

    // Fetch public portfolio data for context
    const getPortfolioContext = async () => {
      try {
        const [profileSnap, skillsSnap, expSnap, projectsSnap, blogsSnap] = await Promise.all([
          adminDb.collection('profile').doc('main').get().catch(err => {
            console.error('Error fetching profile:', err);
            return null;
          }),
          adminDb.collection('skills').orderBy('order', 'asc').limit(15).get().catch(err => {
            console.error('Error fetching skills:', err);
            return null;
          }),
          adminDb.collection('experience').orderBy('order', 'asc').limit(10).get().catch(err => {
            console.error('Error fetching experience:', err);
            return null;
          }),
          adminDb.collection('projects').where('status', '==', 'published').orderBy('order', 'asc').limit(10).get().catch(err => {
            console.error('Error fetching projects:', err);
            return null;
          }),
          adminDb.collection('blogPosts').where('status', '==', 'published').orderBy('publishedAt', 'desc').limit(5).get().catch(err => {
            console.error('Error fetching blog posts:', err);
            return null;
          }),
        ]);

        let contextParts: string[] = [];

        // Profile info
        if (profileSnap && profileSnap.exists) {
          const p = profileSnap.data();
          if (p?.name) contextParts.push(`Name: ${p.name}`);
          if (p?.nickname) contextParts.push(`Nickname: ${p.nickname}`);
          if (p?.title) contextParts.push(`Title: ${p.title}`);
          if (p?.specialization) contextParts.push(`Specialization: ${p.specialization}`);
          if (p?.description) contextParts.push(`Bio: ${p.description}`);
          if (p?.email) contextParts.push(`Email: ${p.email}`);
          if (p?.location) contextParts.push(`Location: ${p.location}`);
        } else {
          console.log('No profile data found');
        }

        // Skills
        if (skillsSnap && skillsSnap.docs?.length) {
          const skills = skillsSnap.docs.map(d => {
            const data = d.data();
            let skillStr = data.name;
            if (data.level || data.proficiency) {
              skillStr += ` (${data.level || data.proficiency})`;
            }
            if (data.category) {
              skillStr += ` [${data.category}]`;
            }
            return skillStr;
          }).filter(Boolean);
          if (skills.length) contextParts.push(`Skills:\n${skills.join(', ')}`);
        }

        // Projects
        if (projectsSnap && projectsSnap.docs?.length) {
          const projects = projectsSnap.docs.map(d => {
            const data = d.data();
            let proj = `"${data.title}"`;
            if (data.description) {
              proj += `: ${data.description}`;
            }
            if (data.longDescription) {
              proj += `. Details: ${data.longDescription.substring(0, 150)}`;
            }
            if (Array.isArray(data.technologies) && data.technologies.length > 0) {
              proj += `. Technologies: ${data.technologies.join(', ')}`;
            }
            if (data.category) {
              proj += ` (Category: ${data.category})`;
            }
            return proj;
          }).filter(Boolean);
          if (projects.length) contextParts.push(`Projects:\n${projects.join('\n')}`);
        }

        // Experience
        if (expSnap && expSnap.docs?.length) {
          const experiences = expSnap.docs.map(d => {
            const data = d.data();
            let exp = `${data.title || data.position || 'Position'} at ${data.company}`;
            
            // Add date range
            if (data.startDate) {
              const start = data.startDate;
              const end = data.current ? 'Present' : (data.endDate || 'Present');
              exp += ` (${start} - ${end})`;
            } else if (data.period) {
              exp += ` (${data.period})`;
            }
            
            // Add description if available
            if (data.description) {
              exp += `: ${data.description}`;
            }
            
            // Add responsibilities if available
            if (Array.isArray(data.responsibilities) && data.responsibilities.length > 0) {
              exp += `. Responsibilities: ${data.responsibilities.slice(0, 3).join('; ')}`;
            }
            
            return exp;
          }).filter(Boolean);
          if (experiences.length) contextParts.push(`Experience:\n${experiences.join('\n')}`);
        }

        // Blog posts
        if (blogsSnap && blogsSnap.docs?.length) {
          const blogs = blogsSnap.docs.map(d => {
            const data = d.data();
            let blogStr = data.title;
            if (data.excerpt) {
              blogStr += `: ${data.excerpt}`;
            }
            if (data.category) {
              blogStr += ` [${data.category}]`;
            }
            return blogStr;
          }).filter(Boolean);
          if (blogs.length) contextParts.push(`Recent blog posts:\n${blogs.join('\n')}`);
        }

        const context = contextParts.join('\n\n');
        console.log('Portfolio context constructed:', context ? `${context.substring(0, 200)}...` : 'EMPTY');
        console.log('Context parts count:', contextParts.length);
        return context || 'No portfolio data available yet.';
      } catch (e) {
        console.error('Error fetching portfolio context:', e);
        return 'Portfolio data temporarily unavailable.';
      }
    };

    const portfolioContext = await getPortfolioContext();
    console.log('Final portfolio context length:', portfolioContext.length);

    // Build conversation context
    const conversationContext = [];
    
    // Add system prompt with portfolio context
    const systemMessage = `${PUBLIC_SYSTEM_PROMPT}\n\n**Portfolio Context:**\n${portfolioContext}`;
    console.log('System message with context length:', systemMessage.length);
    conversationContext.push({ role: "user", parts: [{ text: systemMessage }] });
    conversationContext.push({ 
      role: "model", 
      parts: [{ text: "Hello! I'm AP's Clover, here to help you learn about this portfolio and answer any questions you have. How can I assist you today? 😊" }] 
    });
    
    // Add recent chat history (last 10 messages)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach((msg: any) => {
      if (msg.role && msg.text && !msg.loading) {
        conversationContext.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    });
    
    // Add current user message
    conversationContext.push({ role: "user", parts: [{ text: prompt }] });

    // Generate response
    const resp: any = await ai.models.generateContent({ 
      model: "gemini-2.0-flash-exp", 
      contents: conversationContext 
    });
    
    let text = "";
    if (typeof resp === "string") text = resp;
    text = text || resp?.text || resp?.output?.[0]?.content || resp?.candidates?.[0]?.content || resp?.candidates?.[0]?.text || "";

    return NextResponse.json({ 
      reply: text,
      remaining: rateLimitResult.remaining - 1, // Subtract 1 since we're using one now
      resetAt: rateLimitResult.resetAt
    });
    
  } catch (err: any) {
    console.error("/api/public/chat error:", err);
    return NextResponse.json({ 
      error: "Failed to generate response",
      message: String(err?.message || err)
    }, { status: 500 });
  }
}
