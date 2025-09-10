'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  User, 
  Briefcase, 
  Award, 
  Code, 
  FolderOpen, 
  Mail,
  Menu,
  X,
  Home,
  ChevronLeft,
  Settings,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prevSnapshot, setPrevSnapshot] = useState<{
    path: string | null;
    node: React.ReactNode | null;
  }>({ path: null, node: null });
  const snapshotRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const pageCacheRef = useRef<Map<string, React.ReactNode>>(new Map());

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { id: 'profile', label: 'Profile', icon: User, path: '/admin/profile' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/admin/projects' },
    { id: 'experience', label: 'Experience', icon: Briefcase, path: '/admin/experience' },
    { id: 'skills', label: 'Skills', icon: Code, path: '/admin/skills' },
    { id: 'blog', label: 'Blog', icon: BookOpen, path: '/admin/blog' },
    { id: 'contacts', label: 'Messages', icon: Mail, path: '/admin/contacts' },
    { id: 'achievements', label: 'Achievements', icon: Award, path: '/admin/achievements' },
    { id: 'settings', label: 'Site Settings', icon: Settings, path: '/admin/site-settings' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // Fetch site settings for admin title
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setSiteSettings(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  // Set document title for admin pages
  useEffect(() => {
    const siteName = siteSettings?.general?.siteTitle || siteSettings?.navigation?.siteName || 'Portfolio';
    
    // Get page-specific title based on pathname
    let pageType = 'Admin';
    if (pathname.includes('/dashboard')) pageType = 'Admin Dashboard';
    else if (pathname.includes('/profile')) pageType = 'Admin Profile';
    else if (pathname.includes('/projects')) pageType = 'Admin Projects';
    else if (pathname.includes('/experience')) pageType = 'Admin Experience';
    else if (pathname.includes('/skills')) pageType = 'Admin Skills';
    else if (pathname.includes('/blog')) pageType = 'Admin Blog';
    else if (pathname.includes('/contacts')) pageType = 'Admin Messages';
    else if (pathname.includes('/achievements')) pageType = 'Admin Achievements';
    else if (pathname.includes('/site-settings')) pageType = 'Admin Settings';
    
    const pageTitle = `${siteName} | ${pageType}`;
    document.title = pageTitle;
  }, [siteSettings, pathname]);

  // Prefetch admin pages to speed up client-side navigation
  useEffect(() => {
    // Prefetch in background after mount
    navigationItems.forEach((item) => {
      try {
        // router.prefetch is available in next/navigation client router
        // It's a void-returning call in this runtime; wrap in try/catch to avoid uncaught exceptions
        router.prefetch?.(item.path as any);
      } catch (e) {
        // ignore prefetch errors
      }
    });
  }, []); // run once on mount

  // Keep previous children mounted briefly during route transitions to avoid blanking
  useEffect(() => {
    // store previous children snapshot
    setPrevSnapshot((s) => ({ path: s.path ?? pathname, node: s.node ?? children }));
    // clear any existing timeout
    if (snapshotRef.current) {
      clearTimeout(snapshotRef.current as unknown as number);
    }
    // keep previous content for 300ms to allow new route to hydrate
    snapshotRef.current = setTimeout(() => {
      setPrevSnapshot({ path: null, node: null });
      snapshotRef.current = null;
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Cache rendered admin pages client-side so revisiting a page is instant
  useEffect(() => {
    try {
      pageCacheRef.current.set(pathname, children);
    } catch (e) {
      // ignore caching errors
    }
  }, [pathname, children]);

  // Don't show layout on login page
  // Don't show layout on login, forgot-password, or reset-password pages
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password'
  ) {
    return <>{children}</>;
  }

  const currentPage = navigationItems.find(item => item.path === pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <h1 className="text-xl font-semibold text-gray-900">
                {currentPage?.label || 'Admin Panel'}
              </h1>
              <span className="hidden sm:block text-sm text-gray-500">Welcome back!</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 text-sm hidden sm:block"
              >
                View Portfolio
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={16} />
                <span className="text-sm hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => { try { router.prefetch?.(item.path as any); } catch(e){} }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Mobile Sidebar */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div 
                className="bg-white w-64 h-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <nav className="p-4 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        onMouseEnter={() => { try { router.prefetch?.(item.path as any); } catch(e){} }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <main className="flex-1 relative">
            {/* previous snapshot sits underneath until cleared */}
            {prevSnapshot.node && (
              <div className="absolute inset-0">
                <div className="h-full w-full">{prevSnapshot.node}</div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              {/* Render cached page if available to avoid remounting heavy client bundles */}
              {(pageCacheRef.current.get(pathname) as React.ReactNode) ?? children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
