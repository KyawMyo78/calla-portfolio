'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Play, Calendar, Star, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { analytics } from '@/lib/analytics';

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  status: 'completed' | 'in-progress' | 'planned';
  featured: boolean;
  technologies: string[];
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  downloadUrl?: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
  order: number;
  slug?: string;
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default function ProjectPage({ params }: PageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First, fetch all projects to find the one with matching slug
        const response = await fetch('/api/portfolio/projects');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Find project by slug or title
          const foundProject = data.data.find((p: Project) => 
            p.slug === params.slug || 
            p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.slug
          );
          
        if (foundProject) {
          setProject(foundProject);
          // Track project view
          analytics.projectView(foundProject.title);
        } else {
          setError('Project not found');
        }
      } else {
        setError('Failed to load project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Error loading project');
    } finally {
      setIsLoading(false);
    }
  };

  fetchProject();
}, [params.slug]);  // Function to update page metadata for social sharing
  const updatePageMetadata = (project: Project) => {
  const title = `${project.title} | Projects`;
    const description = project.description;
    const imageUrl = project.images && project.images[0] ? 
      (project.images[0].startsWith('http') ? project.images[0] : `${window.location.origin}${project.images[0]}`) : 
      `${window.location.origin}/api/og?title=${encodeURIComponent(project.title)}`;
    const url = window.location.href;

    // Update document title
    document.title = title;

    // Remove existing meta tags
    const existingMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"]');
    existingMetaTags.forEach(tag => tag.remove());

    // Create and add new meta tags
    const metaTags = [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'article' },
  { property: 'og:site_name', content: 'Projects' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:creator', content: '@kyawmyokhant' }, // Replace with your actual Twitter handle
    ];

    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.name = name;
      if (property) meta.setAttribute('property', property);
      meta.content = content;
      document.head.appendChild(meta);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    notFound();
  }

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    planned: 'bg-royal-100 text-royal-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              href="/#projects"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Projects</span>
            </Link>
            
            <div className="flex gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => analytics.projectLinkClick(project.title, 'github')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Github size={18} />
                  <span className="hidden sm:inline">Code</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => analytics.projectLinkClick(project.title, 'live')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ExternalLink size={18} />
                  <span className="hidden sm:inline">Live Demo</span>
                </a>
              )}
              {project.downloadUrl && (
                <a
                  href={project.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => analytics.projectLinkClick(project.title, 'demo')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play size={18} />
                  <span className="hidden sm:inline">Demo</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Project Image */}
          {project.images && project.images[0] && (
            <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={project.images[0]}
                alt={project.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Project Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">
              {project.title}
            </h1>
            <p className="text-xl text-primary-600 max-w-3xl mx-auto leading-relaxed">
              {project.description}
            </p>
            
            {/* Project Meta */}
            <div className="flex items-center justify-center gap-6 mt-6 text-primary-600">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>
                  {new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                  {project.status === 'in-progress' && !project.endDate && ' - Present'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={18} />
                <span>{project.category}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-primary-800 mb-6">About This Project</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {project.longDescription || project.description}
                </p>
              </div>
            </motion.section>

            {/* Key Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-primary-800 mb-6">Key Highlights</h2>
                <div className="grid gap-4">
                  {project.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-primary-100">
                      <Star size={20} className="text-primary-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{highlight}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Project Gallery */}
            {project.images && project.images.length > 1 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-primary-800 mb-6">Project Gallery</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {project.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${project.title} - Image ${index + 2}`}
                        width={500}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Technologies */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-primary-100 mb-8"
            >
              <h3 className="text-xl font-bold text-primary-800 mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Project Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-primary-100 mb-8"
            >
              <h3 className="text-xl font-bold text-primary-800 mb-4">Project Links</h3>
              <div className="space-y-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.projectLinkClick(project.title, 'github')}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Github size={20} className="text-gray-700" />
                    <div>
                      <div className="font-medium text-gray-900">Source Code</div>
                      <div className="text-sm text-gray-600">View on GitHub</div>
                    </div>
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.projectLinkClick(project.title, 'live')}
                    className="flex items-center gap-3 p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <ExternalLink size={20} className="text-primary-600" />
                    <div>
                      <div className="font-medium text-primary-900">Live Demo</div>
                      <div className="text-sm text-primary-600">Try it online</div>
                    </div>
                  </a>
                )}
                {project.downloadUrl && (
                  <a
                    href={project.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.projectLinkClick(project.title, 'demo')}
                    className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Play size={20} className="text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Demo</div>
                      <div className="text-sm text-green-600">Download or view</div>
                    </div>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Share Project */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-primary-100"
            >
              <h3 className="text-xl font-bold text-primary-800 mb-4">Share This Project</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }}
                  className="w-full p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-left"
                >
                  <div className="font-medium text-primary-900">Copy Link</div>
                  <div className="text-sm text-primary-600">Share this project</div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
