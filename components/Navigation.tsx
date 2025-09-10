'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, User, Code, Briefcase, FolderOpen, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation({ siteSettings: serverSettings }: { siteSettings?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(serverSettings || null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);

    if (serverSettings) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const fetchSettings = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/site-settings?t=${timestamp}`);
        const result = await response.json();
        if (result.success) setSiteSettings(result.data);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    window.addEventListener('scroll', handleScroll);
    fetchSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [serverSettings]);

  // Dynamic navigation items based on site settings
  const navItems = [
    { name: siteSettings?.navigation?.homeText || 'Home', href: '/', icon: Home },
    { name: siteSettings?.navigation?.aboutText || 'About', href: '/about', icon: User },
    { name: siteSettings?.navigation?.skillsText || 'Skills', href: '/skills', icon: Code },
    { name: siteSettings?.navigation?.experienceText || 'Experience', href: '/experience', icon: Briefcase },
    { name: siteSettings?.navigation?.projectsText || 'Projects', href: '/projects', icon: FolderOpen },
    { name: siteSettings?.navigation?.contactText || 'Contact', href: '/contact', icon: Mail },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/"
              onClick={handleNavClick}
              className="text-2xl font-bold text-gradient"
            >
              {siteSettings?.navigation?.siteName || siteSettings?.profile?.name || 'Your Name'}
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-primary-900 bg-primary-100'
                      : 'text-primary-600 hover:text-primary-900 hover:bg-primary-50'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-primary-600 hover:text-primary-900 hover:bg-primary-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-primary-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      pathname === item.href
                        ? 'text-primary-900 bg-primary-100'
                        : 'text-primary-600 hover:text-primary-900 hover:bg-primary-50'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
