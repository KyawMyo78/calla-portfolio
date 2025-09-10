'use client';

import { useState, useEffect } from 'react';
import { Save, Settings, Home, User, Code, Briefcase, FolderOpen, Mail, AlertCircle, Menu, Check, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SiteSettings {
  general?: {
    siteTitle?: string;
    siteDescription?: string;
    siteKeywords?: string[];
    authorName?: string;
  };
  // Hero Section
  hero: {
    greetingText: string;
    contactButtonText: string;
    cvButtonText: string;
    cvNotAvailableText: string;
    scrollIndicatorText?: string;
  };
  // Navigation
  navigation: {
  siteName?: string;
    homeText: string;
    aboutText: string;
    skillsText: string;
    experienceText: string;
    projectsText: string;
    contactText: string;
  };
  // About Section
  about: {
    sectionTitle: string;
    sectionSubtitle?: string;
  };
  // Skills Section
  skills: {
    sectionTitle: string;
    sectionSubtitle?: string;
  };
  // Experience Section
  experience: {
    sectionTitle: string;
    sectionSubtitle?: string;
  };
  // Projects Section
  projects: {
    sectionTitle: string;
    sectionSubtitle?: string;
    viewProjectText: string;
    githubLinkText: string;
    liveDemoText: string;
  };
  // Contact Section
  contact: {
    sectionTitle: string;
    sectionSubtitle?: string;
    submitButtonText: string;
    nameFieldLabel: string;
    emailFieldLabel: string;
    messageFieldLabel: string;
    phoneFieldLabel?: string;
    subjectFieldLabel?: string;
  // New contact content
  connectTitle?: string;
  connectIntro?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  location?: string;
  responseTime?: string;
  whyWorkWithMe?: string[];
  findMeOnlineText?: string;
  quickContactEmail?: string;
  quickContactPhone?: string;
  readyToStartTitle?: string;
  readyToStartEmailText?: string;
  readyToStartCallText?: string;
  };
  // Footer
  footer: {
    copyrightText: string;
    madeWithText?: string;
  };
}

const defaultSettings: SiteSettings = {
  hero: {
    greetingText: 'Hello, I\'m',
    contactButtonText: 'Get In Touch',
    cvButtonText: 'Download CV',
    cvNotAvailableText: 'CV Not Available',
    scrollIndicatorText: 'Scroll to explore'
  },
  navigation: {
  siteName: 'Your Name',
    homeText: 'Home',
    aboutText: 'About',
    skillsText: 'Skills',
    experienceText: 'Experience',
    projectsText: 'Projects',
    contactText: 'Contact'
  },
  general: {
  siteTitle: 'Your Name - Portfolio',
  siteDescription: 'Portfolio website showcasing projects, skills, and contact information.',
  siteKeywords: ['portfolio','developer','web'],
  authorName: 'Your Name'
  },
  about: {
    sectionTitle: 'About Me',
    sectionSubtitle: 'Get to know me better'
  },
  skills: {
    sectionTitle: 'Skills & Technologies',
    sectionSubtitle: 'Technologies I work with'
  },
  experience: {
    sectionTitle: 'Experience',
    sectionSubtitle: 'My professional journey'
  },
  projects: {
    sectionTitle: 'Featured Projects',
    sectionSubtitle: 'Some of my recent work',
    viewProjectText: 'View Project',
    githubLinkText: 'GitHub',
    liveDemoText: 'Live Demo'
  },
  contact: {
    sectionTitle: 'Get In Touch',
    sectionSubtitle: 'Let\'s work together',
    submitButtonText: 'Send Message',
    nameFieldLabel: 'Full Name',
    emailFieldLabel: 'Email Address',
    messageFieldLabel: 'Message',
    phoneFieldLabel: 'Phone Number',
    subjectFieldLabel: 'Subject'
  ,
  // New default contact content
    connectTitle: 'Let\'s Connect',
    connectIntro: 'I\'m always excited to discuss new opportunities, innovative projects, or just chat about technology. Whether you have a specific project in mind or want to explore possibilities, I\'d love to hear from you.',
    primaryEmail: 'your.email@example.com (hint)',
    primaryPhone: '+[country-code][number] (hint)',
    location: 'City • Country or time zone (hint)',
    responseTime: 'e.g. Within 24 hours (hint)',
    whyWorkWithMe: [
      'Dedicated to delivering high-quality solutions',
      'Strong communication throughout the project',
      'Experienced in both hardware and software development',
      'Passionate about turning ideas into reality'
    ],
    findMeOnlineText: 'Short note about where to find you online (social links, profiles, etc.)',
    quickContactEmail: 'contact@example.com (hint)',
    quickContactPhone: '+[country-code][number] (hint)',
    readyToStartTitle: 'Ready to Start Your Project?',
    readyToStartEmailText: 'Email Me',
    readyToStartCallText: 'Call Now'
  },
  footer: {
    copyrightText: '© 2024 Portfolio. All rights reserved.',
    madeWithText: 'Made with ❤️ using Next.js'
  },
};

export default function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [whyFocusIndex, setWhyFocusIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/site-settings');
      const result = await response.json();
      if (result.success && result.data) {
        const incoming = { ...result.data } as any;
        // Ensure whyWorkWithMe is always an array of strings
        if (incoming.contact && incoming.contact.whyWorkWithMe) {
          if (typeof incoming.contact.whyWorkWithMe === 'string') {
            incoming.contact.whyWorkWithMe = incoming.contact.whyWorkWithMe
              .split(/\r?\n|\n|\r/) // split on new lines
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0);
          } else if (!Array.isArray(incoming.contact.whyWorkWithMe)) {
            // fallback: try to coerce to array
            incoming.contact.whyWorkWithMe = [String(incoming.contact.whyWorkWithMe)];
          }
        }

        setSettings({ ...defaultSettings, ...incoming });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast.error('Failed to load site settings');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSectionChange = (section: keyof SiteSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      let resultBody: any = null;
      try {
        resultBody = await response.json();
      } catch (e) {
        // If response isn't JSON, capture text for debugging
        const text = await response.text();
        resultBody = { success: false, message: text };
      }

      if (response.ok && resultBody?.success) {
        setSuccess(true);
        toast.success('Site settings saved successfully!');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const serverMessage = resultBody?.message || resultBody?.error || `HTTP ${response.status}`;
        console.error('Failed to save site settings:', response.status, serverMessage, resultBody);
        toast.error(`Failed to save site settings: ${serverMessage}`);
      }
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast.error('Failed to save site settings (check console for details)');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-pink-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
              <p className="text-gray-600">Customize all text content across your portfolio</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : success
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <Save size={20} />
            <span>{loading ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Important Note</h3>
            <p className="text-sm text-amber-700 mt-1">
              Changes made here will immediately reflect on your live website. Make sure to preview your changes before saving.
            </p>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
            <input
              type="text"
              value={settings.general?.siteTitle || ''}
              onChange={(e) => handleSectionChange('general' as any, 'siteTitle', e.target.value)}
              placeholder="Site title used in meta and layout"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea
              value={settings.general?.siteDescription || ''}
              onChange={(e) => handleSectionChange('general' as any, 'siteDescription', e.target.value)}
              placeholder="Short description used for meta"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma separated)</label>
            <input
              type="text"
              value={(settings.general?.siteKeywords || []).join(', ')}
              onChange={(e) => handleSectionChange('general' as any, 'siteKeywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="portfolio, developer, web"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
            <input
              type="text"
              value={settings.general?.authorName || ''}
              onChange={(e) => handleSectionChange('general' as any, 'authorName', e.target.value)}
              placeholder="Author name used in meta"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Hero Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <Home className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Hero Section (Home Page)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Greeting Text
            </label>
            <input
              type="text"
              value={settings.hero.greetingText}
              onChange={(e) => handleSectionChange('hero', 'greetingText', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hello, I'm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Button Text
            </label>
            <input
              type="text"
              value={settings.hero.contactButtonText}
              onChange={(e) => handleSectionChange('hero', 'contactButtonText', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Get In Touch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CV Button Text
            </label>
            <input
              type="text"
              value={settings.hero.cvButtonText}
              onChange={(e) => handleSectionChange('hero', 'cvButtonText', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Download CV"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CV Not Available Text
            </label>
            <input
              type="text"
              value={settings.hero.cvNotAvailableText}
              onChange={(e) => handleSectionChange('hero', 'cvNotAvailableText', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CV Not Available"
            />
          </div>
        </div>
      </div>

      {/* Navigation Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <Menu className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Navigation Menu</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name (Logo)
            </label>
            <input
              type="text"
              value={(settings.navigation as any).siteName || ''}
              onChange={(e) => handleSectionChange('navigation', 'siteName', e.target.value)}
              placeholder="Site name shown in navbar (e.g. Your Name)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Menu Text
            </label>
            <input
              type="text"
              value={settings.navigation.homeText}
              onChange={(e) => handleSectionChange('navigation', 'homeText', e.target.value)}
              placeholder="Home"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Menu Text
            </label>
            <input
              type="text"
              value={settings.navigation.aboutText}
              onChange={(e) => handleSectionChange('navigation', 'aboutText', e.target.value)}
              placeholder="About"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills Menu Text
            </label>
            <input
              type="text"
              value={settings.navigation.skillsText}
              onChange={(e) => handleSectionChange('navigation', 'skillsText', e.target.value)}
              placeholder="Skills"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Menu Text
            </label>
            <input
              type="text"
              value={settings.navigation.experienceText}
              onChange={(e) => handleSectionChange('navigation', 'experienceText', e.target.value)}
              placeholder="Experience"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projects Menu Text
            </label>
            <input
              type="text"
              value={settings.navigation.projectsText}
              onChange={(e) => handleSectionChange('navigation', 'projectsText', e.target.value)}
              placeholder="Projects"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Menu Text
            </label>
            <input
              type="text"
              value={settings.navigation.contactText}
              onChange={(e) => handleSectionChange('navigation', 'contactText', e.target.value)}
              placeholder="Contact"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Section Titles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* About Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-6">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">About Section</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.about.sectionTitle}
                onChange={(e) => handleSectionChange('about', 'sectionTitle', e.target.value)}
                placeholder="About Me"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle (Optional)
              </label>
              <input
                type="text"
                value={settings.about.sectionSubtitle || ''}
                onChange={(e) => handleSectionChange('about', 'sectionSubtitle', e.target.value)}
                placeholder="Short subtitle (optional)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-6">
            <Code className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Skills Section</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.skills.sectionTitle}
                onChange={(e) => handleSectionChange('skills', 'sectionTitle', e.target.value)}
                placeholder="Skills & Technologies"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle (Optional)
              </label>
              <input
                type="text"
                value={settings.skills.sectionSubtitle || ''}
                onChange={(e) => handleSectionChange('skills', 'sectionSubtitle', e.target.value)}
                placeholder="Optional subtitle (e.g., Technologies I work with)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-6">
            <Briefcase className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Experience Section</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.experience.sectionTitle}
                onChange={(e) => handleSectionChange('experience', 'sectionTitle', e.target.value)}
                placeholder="Experience"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle (Optional)
              </label>
              <input
                type="text"
                value={settings.experience.sectionSubtitle || ''}
                onChange={(e) => handleSectionChange('experience', 'sectionSubtitle', e.target.value)}
                placeholder="Optional subtitle (e.g., My professional journey)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-6">
            <FolderOpen className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Projects Section</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={settings.projects.sectionTitle}
                onChange={(e) => handleSectionChange('projects', 'sectionTitle', e.target.value)}
                placeholder="Featured Projects"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle (Optional)
              </label>
              <input
                type="text"
                value={settings.projects.sectionSubtitle || ''}
                onChange={(e) => handleSectionChange('projects', 'sectionSubtitle', e.target.value)}
                placeholder="Optional subtitle (e.g., Some of my recent work)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Project Button Text
              </label>
              <input
                type="text"
                value={settings.projects.viewProjectText}
                onChange={(e) => handleSectionChange('projects', 'viewProjectText', e.target.value)}
                placeholder="View Project"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Link Text
              </label>
              <input
                type="text"
                value={settings.projects.githubLinkText}
                onChange={(e) => handleSectionChange('projects', 'githubLinkText', e.target.value)}
                placeholder="GitHub"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Demo Text
              </label>
              <input
                type="text"
                value={settings.projects.liveDemoText}
                onChange={(e) => handleSectionChange('projects', 'liveDemoText', e.target.value)}
                placeholder="Live Demo"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <Mail className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Contact Section</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Connect Title</label>
            <input
              type="text"
              value={settings.contact.connectTitle || ''}
              onChange={(e) => handleSectionChange('contact', 'connectTitle', e.target.value)}
              placeholder="Let's Connect"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Connect Intro</label>
            <textarea
              value={settings.contact.connectIntro || ''}
              onChange={(e) => handleSectionChange('contact', 'connectIntro', e.target.value)}
              placeholder="Intro paragraph for contact section (e.g., I'm open to new projects...)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="text"
                value={settings.contact.primaryEmail || ''}
                onChange={(e) => handleSectionChange('contact', 'primaryEmail', e.target.value)}
                placeholder="your.email@example.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={settings.contact.primaryPhone || ''}
                onChange={(e) => handleSectionChange('contact', 'primaryPhone', e.target.value)}
                placeholder="+[country-code][number]"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={settings.contact.location || ''}
                onChange={(e) => handleSectionChange('contact', 'location', e.target.value)}
                placeholder="City • Country or timezone (e.g., London, UK)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Time</label>
            <input
              type="text"
              value={settings.contact.responseTime || ''}
              onChange={(e) => handleSectionChange('contact', 'responseTime', e.target.value)}
              placeholder="e.g. Within 24 hours"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Me (Quick Contact)</label>
              <input
                type="text"
                value={settings.contact.quickContactEmail || ''}
                onChange={(e) => handleSectionChange('contact', 'quickContactEmail', e.target.value)}
                placeholder="contact@example.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Call Me (Quick Contact)</label>
              <input
                type="text"
                value={settings.contact.quickContactPhone || ''}
                onChange={(e) => handleSectionChange('contact', 'quickContactPhone', e.target.value)}
                placeholder="+[country-code][number]"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Why Work With Me? (bullet list)</label>
            <div className="space-y-2">
      {Array.isArray(settings.contact.whyWorkWithMe) && settings.contact.whyWorkWithMe.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <div className="mt-2 text-green-600"><Check className="h-4 w-4" /></div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const next = [...(settings.contact.whyWorkWithMe || [])];
                      next[idx] = e.target.value;
                      handleSectionChange('contact', 'whyWorkWithMe', next as any);
                    }}
        placeholder={item === '' ? 'New reason...' : undefined}
        autoFocus={whyFocusIndex === idx}
        onFocus={() => setWhyFocusIndex(null)}
        className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={() => {
                    const next = [...(settings.contact.whyWorkWithMe || [])];
                    next.splice(idx, 1);
                    handleSectionChange('contact', 'whyWorkWithMe', next as any);
                  }} className="text-red-500 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => {
                const next = [...(settings.contact.whyWorkWithMe || [])];
                next.push('');
                handleSectionChange('contact', 'whyWorkWithMe', next as any);
                setWhyFocusIndex(next.length - 1);
              }} className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md text-sm">
                <Plus className="h-4 w-4" />
                <span>Add item</span>
              </button>
            </div>
          </div>
  </div>
      </div>

  {/* Footer Section removed per user request */}

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center space-x-2 px-8 py-4 rounded-lg font-medium transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : success
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          <Save size={20} />
          <span>{loading ? 'Saving...' : success ? 'Saved!' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
      );
    }
