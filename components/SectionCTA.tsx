'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SectionCTAProps {
  currentSection: 'home' | 'about' | 'skills' | 'experience' | 'projects' | 'blog' | 'contact';
  siteSettings?: any;
  className?: string;
}

// Define section order and metadata
const SECTIONS = [
  { key: 'home', path: '/', name: 'Home', settingsKey: null },
  { key: 'about', path: '/about', name: 'About', settingsKey: 'about' },
  { key: 'skills', path: '/skills', name: 'Skills', settingsKey: 'skills' },
  { key: 'experience', path: '/experience', name: 'Experience', settingsKey: 'experience' },
  { key: 'projects', path: '/projects', name: 'Projects', settingsKey: 'projects' },
  { key: 'blog', path: '/blog', name: 'Blog', settingsKey: 'blog' },
  { key: 'contact', path: '/contact', name: 'Contact', settingsKey: 'contact' },
];

export default function SectionCTA({ currentSection, siteSettings, className = '' }: SectionCTAProps) {
  // Find current section index
  const currentIndex = SECTIONS.findIndex(s => s.key === currentSection);
  
  if (currentIndex === -1 || currentIndex === SECTIONS.length - 1) {
    // Invalid section or last section (contact)
    return null;
  }

  // Find next visible section
  let nextSection = null;
  for (let i = currentIndex + 1; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    
    // Check if section is visible (default to true if not specified)
    const isVisible = section.settingsKey 
      ? (siteSettings?.[section.settingsKey]?.visible ?? true)
      : true;
    
    if (isVisible) {
      nextSection = section;
      break;
    }
  }

  // No next visible section found
  if (!nextSection) {
    return null;
  }

  // Get custom name from settings if available
  const customName = nextSection.settingsKey && siteSettings?.navigation?.[`${nextSection.settingsKey}Text`]
    ? siteSettings.navigation[`${nextSection.settingsKey}Text`]
    : nextSection.name;

  // Generate contextual button text based on the section
  const getButtonText = () => {
    if (!nextSection) return 'Continue';
    
    switch (nextSection.key) {
      case 'about':
        return `Learn More About Me`;
      case 'skills':
        return `View My Skills`;
      case 'experience':
        return `See My Experience`;
      case 'projects':
        return `Browse My Projects`;
      case 'blog':
        return `Read My Blog`;
      case 'contact':
        return `Get In Touch`;
      default:
        return `Explore ${customName}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative text-center py-12 ${className}`}
    >
      <div className="relative z-10">
        <Link href={nextSection.path}>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white rounded-full font-semibold text-lg shadow-[0_8px_30px_rgba(74,109,99,0.35)] hover:shadow-[0_12px_40px_rgba(74,109,99,0.5)] transition-all duration-300 border border-primary-500/20"
          >
            <span className="drop-shadow-sm">{getButtonText()}</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5 drop-shadow-sm" />
            </motion.span>
          </motion.button>
        </Link>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 text-gray-700 text-sm font-medium"
        >
          Continue your journey through my portfolio
        </motion.p>
      </div>
    </motion.div>
  );
}
