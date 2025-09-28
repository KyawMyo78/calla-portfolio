'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  Code,
  FolderOpen,
  Mail,
  Plus,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardData {
  projects?: any[];
  skills?: any[];
  experience?: any[];
  contacts?: any[];
  blogs?: any[];
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({});
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, skillsRes, experienceRes, contactsRes, blogsRes] = await Promise.all([
        fetch('/api/portfolio/projects'),
        fetch('/api/portfolio/skills'),
        fetch('/api/portfolio/experience'),
        fetch('/api/portfolio/contacts'),
        fetch('/api/admin/blog'),
      ]);

      const [projectsData, skillsData, experienceData, contactsData, blogsData] = await Promise.all([
        projectsRes.json(),
        skillsRes.json(),
        experienceRes.json(),
        contactsRes.json(),
        blogsRes.json(),
      ]);

      setData({
        projects: projectsData.data || [],
        skills: skillsData.data || [],
        experience: experienceData.data || [],
        contacts: contactsData.data || [],
        blogs: blogsData.data || [],
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 flex flex-col justify-between h-full"
    >
      <div className="flex flex-col gap-2 mb-2">
        <Icon className="w-6 h-6 text-primary-700" />
        <div>
          <p className="text-sm font-semibold text-primary-700 leading-tight">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick }: any) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 text-left w-full hover:shadow-xl transition-all flex items-center gap-4"
    >
      <div className="flex flex-col gap-2">
        <Icon className="w-6 h-6 text-primary-700" />
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-1 leading-tight">{title}</h3>
          <p className="text-gray-600 text-sm leading-tight">{description}</p>
        </div>
      </div>
    </motion.button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-clover-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
  <div className="bg-gradient-to-r from-clover-700 to-clover-700 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-clover-100">Manage your portfolio content and track your progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
  <StatCard title="Total Projects" value={data.projects?.length || 0} icon={FolderOpen} color="bg-clover-700" />
  <StatCard title="Work Experience" value={data.experience?.length || 0} icon={Briefcase} color="bg-clover-500" />
  <StatCard title="Skills" value={data.skills?.length || 0} icon={Code} color="bg-clover-900" />
  <StatCard title="Blog Posts" value={data.blogs?.length || 0} icon={BookOpen} color="bg-clover-500" />
  <StatCard title="Messages" value={data.contacts?.length || 0} icon={Mail} color="bg-clover-300" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard title="Manage Projects" description="Add, edit, or delete projects" icon={FolderOpen} onClick={() => router.push('/admin/projects')} />
          <QuickActionCard title="Manage Experience" description="Update work history and career" icon={Briefcase} onClick={() => router.push('/admin/experience')} />
          <QuickActionCard title="Manage Skills" description="Update your skill set" icon={Code} onClick={() => router.push('/admin/skills')} />
          <QuickActionCard title="Manage Blog" description="Create and edit blog posts" icon={BookOpen} onClick={() => router.push('/admin/blog')} />
          <QuickActionCard title="View Messages" description="Review contact form submissions" icon={Mail} onClick={() => router.push('/admin/contacts')} />
          <QuickActionCard title="Add New Project" description="Quickly add a new project" icon={Plus} onClick={() => router.push('/admin/projects')} />
          <QuickActionCard title="Portfolio Overview" description="View your live portfolio" icon={User} onClick={() => window.open('/', '_blank')} />
        </div>
      </div>

      {/* Recent Messages */}
      {data.contacts && data.contacts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Messages</h2>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {data.contacts.slice(0, 5).map((contact: any, index: number) => (
              <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">{contact.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {data.contacts.length > 5 && (
              <div className="p-4 text-center">
                <button onClick={() => router.push('/admin/contacts')} className="text-clover-600 hover:text-clover-700 text-sm font-medium">
                  View all messages ({data.contacts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.projects.slice(0, 3).map((project: any, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.technologies?.slice(0, 3).map((tech: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-clover-100 text-clover-700 rounded text-xs">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
