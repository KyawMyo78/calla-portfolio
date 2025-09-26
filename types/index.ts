// Portfolio Data Types
export interface PersonalInfo {
  id?: string;
  fullName: string;
  englishName: string;
  nationality: string;
  age: number;
  email: string;
  phone?: string;
  location: string;
  bio: string;
  profileImage?: string;
  resumeUrl?: string;
  languages: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Education {
  id?: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Skill {
  id?: string;
  name: string;
  category: 'programming' | 'framework' | 'tool' | 'concept' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years?: number;
  icon?: string;
  description?: string;
  featured: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer';
  description: string;
  achievements: string[];
  technologies: string[];
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: 'web' | 'mobile' | 'desktop' | 'embedded' | 'ai' | 'other';
  status: 'completed' | 'in-progress' | 'planned';
  featured: boolean;
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  downloadUrl?: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Achievement {
  id?: string;
  title: string;
  description: string;
  organization: string;
  date: string;
  type: 'award' | 'certification' | 'competition' | 'scholarship' | 'other';
  level: 'local' | 'national' | 'international';
  image?: string;
  featured?: boolean;
  featuredOrder?: number;
  certificateUrl?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: Date;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  author: string;
  readTime: number; // in minutes
  views: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogCategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount?: number;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogTag {
  id?: string;
  name: string;
  slug: string;
  postCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  lastLogin?: Date;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AdminLoginForm {
  email: string;
  password: string;
}

// Component Props Types
export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Utility Types
export type SortOrder = 'asc' | 'desc';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  category?: string;
  status?: string;
  featured?: boolean;
  search?: string;
}
