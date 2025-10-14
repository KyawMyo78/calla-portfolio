'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
}

export default function SkeletonLoader({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '3rem' : '12rem')
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: i * 0.05 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      <div className="w-full h-full animate-shimmer" />
    </motion.div>
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-4">{skeletons}</div>;
}

// Specific skeleton components for common use cases
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <SkeletonLoader variant="rectangular" height="12rem" />
      <div className="p-6 space-y-4">
        <SkeletonLoader variant="text" width="70%" height="1.5rem" />
        <SkeletonLoader variant="text" count={2} />
        <div className="flex gap-2">
          <SkeletonLoader variant="rectangular" width="4rem" height="1.5rem" />
          <SkeletonLoader variant="rectangular" width="4rem" height="1.5rem" />
          <SkeletonLoader variant="rectangular" width="4rem" height="1.5rem" />
        </div>
      </div>
    </div>
  );
}

export function SkillCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <SkeletonLoader variant="circular" width="3rem" height="3rem" />
        <div className="ml-4 flex-1">
          <SkeletonLoader variant="text" width="60%" height="1.25rem" />
          <SkeletonLoader variant="text" width="40%" height="0.875rem" className="mt-2" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <SkeletonLoader variant="text" width="50%" height="1rem" className="mb-2" />
            <SkeletonLoader variant="rectangular" height="0.5rem" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExperienceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-start gap-4 mb-4">
        <SkeletonLoader variant="circular" width="3rem" height="3rem" />
        <div className="flex-1">
          <SkeletonLoader variant="text" width="70%" height="1.5rem" />
          <SkeletonLoader variant="text" width="50%" height="1rem" className="mt-2" />
        </div>
      </div>
      <SkeletonLoader variant="text" count={3} />
      <div className="flex gap-2 mt-4">
        <SkeletonLoader variant="rectangular" width="3rem" height="1.5rem" />
        <SkeletonLoader variant="rectangular" width="3rem" height="1.5rem" />
        <SkeletonLoader variant="rectangular" width="3rem" height="1.5rem" />
      </div>
    </div>
  );
}

export function ContactInfoSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-4">
        <SkeletonLoader variant="circular" width="3rem" height="3rem" />
        <div className="flex-1">
          <SkeletonLoader variant="text" width="40%" height="1rem" />
          <SkeletonLoader variant="text" width="60%" height="1.25rem" className="mt-2" />
        </div>
      </div>
    </div>
  );
}
