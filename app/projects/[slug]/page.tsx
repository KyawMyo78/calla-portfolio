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
  const [isCopied, setIsCopied] = useState(false);

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
  }, [params.slug]);

  if (isLoading) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-clover-100 via-white to-secondary-50">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-clover-700 border-t-transparent rounded-full animate-spin"></div>
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
    planned: 'bg-primary-100 text-primary-700'
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-clover-100 via-white to-secondary-50">
      {/* Navigation */}
  <nav className="bg-white/80 backdrop-blur-sm border-b border-clover-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              href="/projects"
              className="flex items-center gap-2 text-clover-700 hover:text-clover-900 transition-colors"
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
                  className="flex items-center gap-2 px-4 py-2 bg-clover-700 text-white rounded-lg hover:bg-clover-700 transition-colors"
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
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <Image
                src={project.images[0]}
                alt={project.title}
                width={1200}
                height={600}
                className="w-full h-auto object-contain bg-gray-50"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]} backdrop-blur-sm bg-white/20`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Project Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-clover-900 mb-4 break-words">
              {project.title}
            </h1>
            <p className="text-xl text-clover-700 max-w-3xl mx-auto leading-relaxed break-words">
              {project.description}
            </p>
            
            {/* Project Meta */}
            <div className="flex items-center justify-center gap-6 mt-6 text-clover-700">
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

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-clover-900 mb-6">About This Project</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-clover-100 shadow-lg">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
              {project.longDescription || project.description}
            </p>
          </div>
        </motion.section>

        {/* Technologies Section */}
        {project.technologies && project.technologies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-clover-900 mb-6">Technologies Used</h2>
            <div className="bg-gradient-to-br from-clover-50 to-white rounded-2xl p-6 md:p-8 border border-clover-100 shadow-lg">
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="px-4 py-2.5 bg-white text-clover-800 rounded-xl text-sm md:text-base font-semibold border-2 border-clover-200 hover:border-clover-400 hover:shadow-md transition-all cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Key Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-clover-900 mb-6">Key Highlights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {project.highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  className="flex items-start gap-3 p-5 bg-white rounded-xl border border-clover-100 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Star size={20} className="text-clover-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 break-words">{highlight}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Project Gallery */}
        {project.images && project.images.length > 1 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-clover-900 mb-6">Project Gallery</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.images.slice(1).map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  className="aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-gray-50"
                >
                  <Image
                    src={image}
                    alt={`${project.title} - Image ${index + 2}`}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Bottom Action Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Links */}
            {(project.githubUrl || project.liveUrl || project.downloadUrl) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-clover-100 shadow-lg">
                <h3 className="text-2xl font-bold text-clover-900 mb-4 flex items-center gap-2">
                  <ExternalLink size={24} className="text-clover-600" />
                  Project Links
                </h3>
                <div className="space-y-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => analytics.projectLinkClick(project.title, 'github')}
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all hover:shadow-md border border-gray-200"
                    >
                      <Github size={24} className="text-gray-700" />
                      <div>
                        <div className="font-semibold text-gray-900">Source Code</div>
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
                      className="flex items-center gap-3 p-4 bg-clover-50 hover:bg-clover-100 rounded-xl transition-all hover:shadow-md border border-clover-200"
                    >
                      <ExternalLink size={24} className="text-clover-700" />
                      <div>
                        <div className="font-semibold text-clover-900">Live Demo</div>
                        <div className="text-sm text-clover-700">Try it online</div>
                      </div>
                    </a>
                  )}
                  {project.downloadUrl && (
                    <a
                      href={project.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => analytics.projectLinkClick(project.title, 'demo')}
                      className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all hover:shadow-md border border-green-200"
                    >
                      <Play size={24} className="text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">Download</div>
                        <div className="text-sm text-green-600">Get the app</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Share Project */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-clover-100 shadow-lg">
              <h3 className="text-2xl font-bold text-clover-900 mb-4">Share This Project</h3>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  } catch (err) {
                    console.error('Failed to copy: ', err);
                  }
                }}
                className={`w-full p-4 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 ${
                  isCopied 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gradient-to-r from-clover-500 to-clover-600 hover:from-clover-600 hover:to-clover-700 text-white hover:shadow-lg'
                }`}
              >
                <ExternalLink size={20} />
                {isCopied ? '✓ Link Copied!' : 'Copy Project Link'}
              </button>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Share this project with others
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
