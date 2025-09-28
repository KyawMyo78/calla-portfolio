"use client";

import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  MessageCircle,
  Mail,
  Trophy,
  Settings,
  BarChart3,
  Home
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subsections: {
    title: string;
    content: string;
  }[];
}

const manualSections: ManualSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    icon: Home,
    subsections: [
      {
        title: 'Getting Started',
        content: 'The Dashboard is your admin home page. It provides quick access to all admin features and shows an overview of your portfolio content. Use the sidebar navigation to access different sections.'
      },
      {
        title: 'Quick Actions',
        content: 'From the dashboard, you can quickly navigate to add new projects, write blog posts, or update your profile information.'
      }
    ]
  },
  {
    id: 'profile',
    title: 'Profile Management',
    icon: User,
    subsections: [
      {
        title: 'Personal Information',
        content: 'Update your personal details including name, bio, contact information, and professional summary. This information appears on your portfolio homepage.'
      },
      {
        title: 'Profile Photo',
        content: 'Upload and manage your profile photo. Supported formats: JPG, PNG, WebP. Recommended size: 400x400px for best quality.'
      },
      {
        title: 'Social Links',
        content: 'Add links to your social media profiles (LinkedIn, GitHub, Twitter, etc.). These will appear in your portfolio footer and contact section.'
      }
    ]
  },
  {
    id: 'projects',
    title: 'Project Portfolio',
    icon: Briefcase,
    subsections: [
      {
        title: 'Adding Projects',
        content: 'Create new projects by clicking "Add New Project". Fill in project title, description, technologies used, project URL, and GitHub repository link.'
      },
      {
        title: 'Project Images',
        content: 'Upload project screenshots and demo images. You can add multiple images per project. First image becomes the thumbnail.'
      },
      {
        title: 'Managing Projects',
        content: 'Edit existing projects by clicking the edit button. You can reorder projects, mark them as featured, or delete them entirely.'
      },
      {
        title: 'Categories & Tags',
        content: 'Organize projects with categories (Web Development, Mobile App, etc.) and tags (React, TypeScript, etc.) for better portfolio organization.'
      }
    ]
  },
  {
    id: 'experience',
    title: 'Work Experience',
    icon: Briefcase,
    subsections: [
      {
        title: 'Adding Experience',
        content: 'Add your work history including job title, company name, employment dates, and detailed job description. List your key achievements and responsibilities.'
      },
      {
        title: 'Company Logos',
        content: 'Upload company logos to make your experience section more visual and professional. Logos should be square format (200x200px recommended).'
      },
      {
        title: 'Timeline Management',
        content: 'Experiences are automatically sorted by date. Mark current positions as "Present" for ongoing roles. Use the drag-and-drop feature to reorder entries.'
      }
    ]
  },
  {
    id: 'skills',
    title: 'Skills & Technologies',
    icon: GraduationCap,
    subsections: [
      {
        title: 'Skill Categories',
        content: 'Organize skills into categories like Programming Languages, Frameworks, Tools, etc. Each category can have multiple skills with proficiency levels.'
      },
      {
        title: 'Proficiency Levels',
        content: 'Rate your skills from 1-5 stars or use percentage (0-100%). This helps visitors understand your expertise level in different technologies.'
      },
      {
        title: 'Skill Icons',
        content: 'Add icons for technologies and tools. Use the built-in icon picker or upload custom icons. Popular tech icons are included by default.'
      }
    ]
  },
  {
    id: 'blog',
    title: 'Blog Management',
    icon: FileText,
    subsections: [
      {
        title: 'Writing Posts',
        content: 'Create blog posts using the rich text editor. Add headings, lists, links, code blocks, and images. Preview your post before publishing.'
      },
      {
        title: 'Featured Images',
        content: 'Add a featured image for each blog post. This image appears in blog listings and social media previews. Recommended size: 1200x630px.'
      },
      {
        title: 'SEO Optimization',
        content: 'Add meta descriptions, tags, and SEO-friendly URLs. Use the slug field to create clean URLs like "/blog/my-post-title".'
      },
      {
        title: 'Publishing Options',
        content: 'Save posts as drafts or publish immediately. Set publication dates for scheduled posting. Manage post visibility and comments.'
      }
    ]
  },
  {
    id: 'ai-chat',
    title: 'AI Assistant (AP\'s Clover)',
    icon: MessageCircle,
    subsections: [
      {
        title: 'Getting Help',
        content: 'AP\'s Clover is your AI assistant that knows your portfolio inside and out. Ask questions about managing content, using features, or getting advice on your portfolio.'
      },
      {
        title: 'Chat Features',
        content: 'The AI remembers your conversation history and knows your profile, skills, experience, and projects. Get personalized advice and step-by-step guidance.'
      },
      {
        title: 'Quick Access',
        content: 'Use the floating AI button on any admin page for quick help. The chat supports markdown formatting and provides contextual responses.'
      },
      {
        title: 'Common Questions',
        content: 'Ask about: "How do I publish a blog post?", "How can I add a new project?", "What\'s the best way to organize my skills?", or "How do I update my profile?"'
      }
    ]
  },
  {
    id: 'contacts',
    title: 'Contact Messages',
    icon: Mail,
    subsections: [
      {
        title: 'Message Management',
        content: 'View and manage contact form submissions from your portfolio visitors. Messages are organized by date with read/unread status.'
      },
      {
        title: 'Response Actions',
        content: 'Mark messages as read, star important ones, or delete spam. Export contact information for follow-up communications.'
      },
      {
        title: 'Contact Analytics',
        content: 'Track message frequency, popular inquiry types, and response times to improve your client communication.'
      }
    ]
  },
  {
    id: 'achievements',
    title: 'Achievements & Awards',
    icon: Trophy,
    subsections: [
      {
        title: 'Adding Achievements',
        content: 'Showcase your certifications, awards, competitions, and professional achievements. Include achievement title, issuing organization, and date.'
      },
      {
        title: 'Achievement Images',
        content: 'Upload certificate images, award photos, or achievement badges. These add credibility and visual appeal to your portfolio.'
      },
      {
        title: 'Categories',
        content: 'Organize achievements by type: Certifications, Awards, Competitions, Publications, etc. This helps visitors find relevant accomplishments.'
      }
    ]
  },
  {
    id: 'site-settings',
    title: 'Site Configuration',
    icon: Settings,
    subsections: [
      {
        title: 'General Settings',
        content: 'Configure your portfolio\'s basic settings including site title, tagline, favicon, and meta information for better SEO.'
      },
      {
        title: 'Theme Customization',
        content: 'Customize colors, fonts, and layout options. Choose from preset themes or create your own color scheme to match your brand.'
      },
      {
        title: 'Analytics & Tracking',
        content: 'Add Google Analytics, Google Tag Manager, or other tracking codes to monitor your portfolio\'s performance and visitor behavior.'
      },
      {
        title: 'SEO Settings',
        content: 'Configure meta tags, Open Graph settings for social sharing, and structured data for better search engine visibility.'
      }
    ]
  }
];

export default function UserManualPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel User Manual</h1>
            <p className="mt-2 text-gray-600">
              Complete guide to managing your portfolio through the admin panel
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contents</h2>
              <nav className="space-y-2">
                {manualSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      const element = document.getElementById(section.id);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                  >
                    <section.icon className="w-4 h-4 mr-3" />
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Manual Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {manualSections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-lg shadow-sm border"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <section.icon className="w-6 h-6 text-primary-600 mr-4" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        {section.title}
                      </h2>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.includes(section.id) && (
                    <div className="px-6 pb-6">
                      <div className="space-y-6">
                        {section.subsections.map((subsection, index) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {subsection.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {subsection.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Tips Section */}
            <div className="mt-8 bg-primary-50 rounded-lg border border-primary-200 p-6">
              <h2 className="text-lg font-semibold text-primary-900 mb-4">
                💡 Quick Tips for Success
              </h2>
              <ul className="space-y-2 text-primary-800">
                <li>• Keep your content updated regularly to maintain visitor engagement</li>
                <li>• Use high-quality images for better visual appeal</li>
                <li>• Write clear, concise descriptions for better user experience</li>
                <li>• Utilize the AI assistant (AP's Clover) for quick help and guidance</li>
                <li>• Preview your changes before publishing to ensure quality</li>
                <li>• Organize content with categories and tags for better navigation</li>
                <li>• Monitor your contact messages and respond promptly to inquiries</li>
              </ul>
            </div>

            {/* Support Section */}
            <div className="mt-6 bg-gray-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🤝 Need Additional Help?
              </h2>
              <p className="text-gray-600 mb-4">
                If you need assistance beyond this manual, here are your options:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>AI Assistant:</strong> Use AP's Clover (floating button) for instant help</li>
                <li>• <strong>Chat Page:</strong> Visit the dedicated AI chat page for detailed conversations</li>
                <li>• <strong>Contextual Help:</strong> The AI knows your current data and can provide personalized advice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
