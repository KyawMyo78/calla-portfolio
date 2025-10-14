"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ErrorState from './ErrorState';

interface Achievement {
  id: string;
  title: string;
  description?: string;
  date?: string;
  issuer?: string;
  image?: string;
  featured?: boolean;
  featuredOrder?: number;
}

export default function FeaturedAchievements({ maxItems = 3 }: { maxItems?: number }) {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatured();
  }, [maxItems]);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/portfolio/achievements');
      const json = await res.json();
      if (json.success) {
        const all: Achievement[] = json.data || [];
        const featured = all.filter(a => a.featured).sort((a,b) => (a.featuredOrder || 0) - (b.featuredOrder || 0)).slice(0, maxItems);
        setItems(featured);
      } else {
        setError('Failed to load featured achievements. Please try again.');
      }
    } catch (e) {
      console.error('Failed to load featured achievements', e);
      setError('Unable to load featured achievements. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchFeatured();
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="w-8 h-8 border-2 border-clover-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <ErrorState
          title="Failed to Load Featured Achievements"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-6 text-center text-clover-700">
        <p>No featured achievements yet.</p>
      </div>
    );
  }

  return (
    <section id="featured-achievements" className="mb-8">
      <div className="mb-6 flex items-center gap-3">
        <h3 className="text-2xl font-semibold text-clover-900">Featured Achievements</h3>
        <span className="inline-flex items-center bg-gold-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Featured</span>
      </div>
      <p className="text-sm text-clover-700 mb-4">Highlights and selected accomplishments</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-md border border-clover-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-clover-900">{a.title}</h4>
                {a.issuer && <div className="text-sm text-clover-700">{a.issuer} • {a.date ? new Date(a.date).getFullYear() : ''}</div>}
              </div>
              <div className="ml-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gold-500 text-white inline-flex items-center justify-center text-sm font-bold">★</div>
              </div>
            </div>

            {a.description && <p className="mt-3 text-clover-700 text-sm line-clamp-3">{a.description}</p>}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
