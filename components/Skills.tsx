'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Code, 
  Database, 
  Globe, 
  Cpu, 
  Wrench, 
  BookOpen, 
  Star,
  Monitor,
  Server,
  Layers,
  Terminal,
  Zap,
  Settings,
  Palette,
  Shield,
  Cloud,
  GitBranch,
  Package,
  Brain,
  Lightbulb,
  Smartphone
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency?: number;
  level?: string | number; // Support both string and number for level
  yearsOfExperience?: number;
  description?: string;
  icon?: string;
  featured: boolean;
  order: number;
}

const categoryIcons: { [key: string]: any } = {
  'programming': Code,
  'frameworks': Globe,
  'databases': Database,
  'tools': Wrench,
  'embedded': Cpu,
  'other': BookOpen,
  'default': Code
};

const skillIcons: { [key: string]: any } = {
  'code': Code,
  'database': Database,
  'globe': Globe,
  'smartphone': Smartphone,
  'cpu': Cpu,
  'monitor': Monitor,
  'server': Server,
  'layers': Layers,
  'terminal': Terminal,
  'zap': Zap,
  'settings': Settings,
  'palette': Palette,
  'shield': Shield,
  'cloud': Cloud,
  'book': BookOpen,
  'wrench': Wrench,
  'git': GitBranch,
  'package': Package,
  'brain': Brain,
  'lightbulb': Lightbulb
};

const getSkillIcon = (iconKey: string) => {
  return skillIcons[iconKey] || Code;
};

const categoryColors: { [key: string]: string } = {
  'programming': 'from-royal-500 to-royal-600',
  'frameworks': 'from-green-500 to-green-600',
  'databases': 'from-navy-500 to-navy-600',
  'tools': 'from-orange-500 to-orange-600',
  'embedded': 'from-red-500 to-red-600',
  'other': 'from-gray-500 to-gray-600',
  'default': 'from-primary-500 to-primary-600'
};
// Replace default with clover gradient
categoryColors['default'] = 'from-clover-500 to-clover-700';

// Helper function to convert level string to proficiency percentage
const levelToProficiency = (level?: string | number | any): number => {
  if (!level) return 50;
  
  // If it's a number between 1-5 (star rating system), convert to percentage
  if (typeof level === 'number') {
    if (level >= 1 && level <= 5) {
      // Convert 1-5 star system to percentage
      const starToPercentage = {
        1: 20,  // Beginner
        2: 40,  // Novice  
        3: 60,  // Intermediate
        4: 80,  // Advanced
        5: 95   // Expert
      };
      return starToPercentage[level as keyof typeof starToPercentage] || 50;
    }
    // If it's already a percentage (0-100), use it directly
    if (level >= 0 && level <= 100) {
      return level;
    }
  }
  
  // Convert text levels to percentage
  const levelStr = typeof level === 'string' ? level : String(level);
  const levelLower = levelStr.toLowerCase();
  
  if (levelLower.includes('expert')) return 95;
  if (levelLower.includes('advanced')) return 80;
  if (levelLower.includes('intermediate')) return 60;
  if (levelLower.includes('novice')) return 40;
  if (levelLower.includes('beginner') || levelLower.includes('basic')) return 20;
  
  return 50;
};

// Helper function to get proficiency value
const getProficiency = (skill: Skill): number => {
  return skill.proficiency ?? levelToProficiency(skill.level);
};

// Helper function to get years of experience
const getYearsOfExperience = (skill: Skill): number => {
  return skill.yearsOfExperience ?? 0;
};

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/portfolio/skills');
        const data = await response.json();
        
        if (data.success) {
          setSkills(data.data || []);
        } else {
          console.error('Failed to fetch skills:', data.error);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as { [key: string]: Skill[] });

  // Sort categories and skills within categories
  const sortedCategories = Object.keys(skillsByCategory).sort();
  Object.keys(skillsByCategory).forEach(category => {
    skillsByCategory[category].sort((a, b) => a.order - b.order || getProficiency(b) - getProficiency(a));
  });

  if (isLoading) {
    return (
      <section id="skills" className="section-padding">
        <div className="container-width">
            <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-clover-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (skills.length === 0) {
    return (
      <section id="skills" className="section-padding">
        <div className="container-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              My <span className="text-gradient">Skills</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-clover mx-auto mb-6"></div>
            <p className="text-xl text-clover-700 max-w-3xl mx-auto mb-8 text-center">
              Constantly learning and evolving.
            </p>
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🛠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Skills Coming Soon</h3>
              <p className="text-gray-600">Check back to see my technical expertise and capabilities.</p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="section-padding">
      <div className="container-width">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="text-gradient">Skills</span>
          </h2>
            <div className="w-24 h-1 bg-gradient-clover mx-auto mb-6"></div>
          <p className="text-xl text-clover-700 max-w-3xl mx-auto">
            A comprehensive toolkit built through years of hands-on experience and continuous learning.
          </p>
        </motion.div>

        {/* Skills Grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCategories.map((categoryName, categoryIndex) => {
            const categorySkills = skillsByCategory[categoryName];
            const IconComponent = categoryIcons[categoryName] || categoryIcons['default'];
            const colorClass = categoryColors[categoryName] || categoryColors['default'];

            return (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-clover-100"
              >
                {/* Category Header */}
                <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClass} flex items-center justify-center mr-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">
                      {categoryName.replace('-', ' ')}
                    </h3>
                    <p className="text-sm text-gray-600">{categorySkills.length} skills</p>
                  </div>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {categorySkills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {skill.icon && (
                            <span className="mr-2">
                              {(() => {
                                const SkillIconComponent = getSkillIcon(skill.icon);
                                return <SkillIconComponent className="w-4 h-4 text-clover-700" />;
                              })()}
                            </span>
                          )}
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          {skill.featured && (
                            <Star className="w-4 h-4 text-yellow-500 ml-2 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">{getProficiency(skill)}%</span>
                          {getYearsOfExperience(skill) > 0 && (
                            <span className="ml-2 text-xs">
                              {getYearsOfExperience(skill)}yr{getYearsOfExperience(skill) !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${getProficiency(skill)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) + 0.2 }}
                          className={`h-full bg-gradient-to-r ${colorClass} rounded-full relative`}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                        </motion.div>
                      </div>

                      {/* Description */}
                      {skill.description && (
                        <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Skills Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-clover-100 to-clover-100 rounded-3xl p-8"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-3xl font-bold text-clover-900 mb-2">
                {skills.length}
              </h4>
              <p className="text-clover-700 font-medium">Technical Skills</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-clover-900 mb-2">
                {Math.round(skills.reduce((sum, skill) => sum + getProficiency(skill), 0) / skills.length) || 0}%
              </h4>
              <p className="text-clover-700 font-medium">Average Proficiency</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-clover-900 mb-2">
                {Math.round(skills.reduce((sum, skill) => sum + getYearsOfExperience(skill), 0) / skills.length * 10) / 10 || 0}
              </h4>
              <p className="text-clover-700 font-medium">Avg Years Experience</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
