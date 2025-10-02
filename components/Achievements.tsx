"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  issuer?: string | null;
  credentialUrl?: string | null;
  image?: string | null;
  featured?: boolean;
}

export default function Achievements({ excludeFeatured = false }: { excludeFeatured?: boolean }) {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch('/api/portfolio/achievements');
        const json = await res.json();
        if (json.success) setItems(json.data || []);
      } catch (e) {
        console.error('Failed to load achievements', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

    if (loading) {
    return (
      <div className="py-8">
  <div className="w-8 h-8 border-2 border-clover-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <section id="achievements" className="mt-12">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h3 className="text-2xl font-semibold mb-4">Achievements</h3>

        {loading ? (
          <div className="py-8">
            <div className="w-8 h-8 border-2 border-clover-700 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {(excludeFeatured ? items.filter(i => !i.featured) : items).map((a) => (
              <motion.div 
                key={a.id} 
                className="p-4 border rounded-lg bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {a.image && (
                  <div className="mb-3 -mx-4 -mt-4">
                    <img 
                      src={a.image} 
                      alt={a.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{a.title}</h4>
                    <div className="text-sm text-gray-600">
                      {a.issuer ? `${a.issuer} • ` : ''}{new Date(a.date).getFullYear()}
                    </div>
                  </div>
                  {a.credentialUrl && (
                      <a href={a.credentialUrl} target="_blank" rel="noreferrer" className="text-clover-700 text-sm hover:text-clover-900 transition-colors">View</a>
                    )}
                </div>
                {a.description && <p className="mt-2 text-gray-600 text-sm">{a.description}</p>}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-600">
            <p>No achievements published yet.</p>
            <p className="mt-2 text-sm">Add achievements in the admin panel under /admin/achievements.</p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
