'use client';

import { motion } from 'framer-motion';
import { Download, Mail, MapPin, Code2, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getSocialIcon, SocialLink } from '../lib/socialIcons';
import ErrorState from './ErrorState';
import useDataPrefetch from '@/hooks/useDataPrefetch';

interface ProfileData {
  name: string;
  nickname: string;
  title: string;
  specialization: string;
  description: string;
  location: string;
  email: string;
  profileImage: string;
  cvUrl: string;
  socialLinks?: SocialLink[];
  // New fields for complete home page control
  greetingText?: string;
  contactButtonText?: string;
  cvButtonText?: string;
  cvNotAvailableText?: string;
}

export default function Hero({ profile: serverProfile, siteSettings: serverSettings }: { profile?: any; siteSettings?: any }) {
  const [profile, setProfile] = useState<ProfileData | null>(serverProfile || null);
  const [siteSettings, setSiteSettings] = useState<any>(serverSettings || null);
  const [isLoading, setIsLoading] = useState(!serverProfile || !serverSettings);
  const [error, setError] = useState<string | null>(null);

  // Trigger data prefetching for all pages
  useDataPrefetch();

  useEffect(() => {
    // If server props provided, skip client fetching
    if (serverProfile && serverSettings) {
      setIsLoading(false);
      return;
    }

    fetchData();
  }, [serverProfile, serverSettings]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const timestamp = new Date().getTime();

      const [profileResponse, settingsResponse] = await Promise.all([
        fetch(`/api/profile?t=${timestamp}`),
        fetch(`/api/site-settings?t=${timestamp}`)
      ]);

      const profileResult = await profileResponse.json();
      const settingsResult = await settingsResponse.json();

      if (profileResult.success) {
        setProfile(profileResult.data);
      } else {
        setError('Failed to load profile data. Please try again.');
      }

      if (settingsResult.success) {
        setSiteSettings(settingsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Unable to load profile data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchData();
  };

  // Cursor-reactive motion: track normalized pointer and apply gentle offsets to firefly wrappers
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 }); // x,y = current, tx,ty = target
  const rafRef = useRef<number | null>(null);
  const paramsRef = useRef<Array<{ amp: number; speed: number }>>([]);
  const PARTICLE_COUNT = 60;

  useEffect(() => {
    // initialize per-firefly params (reduced count for performance)
  paramsRef.current = Array.from({ length: PARTICLE_COUNT }).map(() => ({ amp: 8 + Math.random() * 22, speed: 0.05 + Math.random() * 0.06 }));

    const onPointerMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width; // 0..1
      const ny = (e.clientY - rect.top) / rect.height; // 0..1
      // center to -0.5..0.5
      cursorRef.current.tx = (nx - 0.5) * 2;
      cursorRef.current.ty = (ny - 0.5) * 2;
    };

    // Throttle updates to ~30fps to avoid jank
    let lastTick = 0;
    const tick = (now?: number) => {
      const tNow = now || Date.now();
      if (tNow - lastTick < 33) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTick = tNow;
      // lerp current towards target
      cursorRef.current.x += (cursorRef.current.tx - cursorRef.current.x) * 0.12;
      cursorRef.current.y += (cursorRef.current.ty - cursorRef.current.y) * 0.12;

      const wrappers = containerRef.current?.querySelectorAll<HTMLElement>('[data-firefly-index]');
      if (wrappers && wrappers.length) {
        const cx = cursorRef.current.x;
        const cy = cursorRef.current.y;
        const t = Date.now() / 1000;
        wrappers.forEach((w) => {
          const i = Number(w.dataset.fireflyIndex || 0);
          const p = paramsRef.current[i] || { amp: 12, speed: 0.06 };
          // per-firefly modulation
          const wobbleX = Math.sin(t * (0.5 + p.speed * 5) + i) * 2;
          const wobbleY = Math.cos(t * (0.5 + p.speed * 4) + i) * 2;
          const tx = cx * p.amp * (0.6 + ((i % 5) / 5)) + wobbleX;
          const ty = cy * p.amp * (0.6 + ((i % 7) / 7)) + wobbleY;
          // apply transform on wrapper so framer-motion inside can still animate x/y
          w.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleContactClick = () => {
    // Navigate to contact page since we're now using multi-page layout
    window.location.href = '/contact';
  };

  const handleWorksClick = () => {
    // Navigate to projects page
    window.location.href = '/projects';
  };

  const handleResumeDownload = () => {
    if (profile?.cvUrl) {
      window.open(profile.cvUrl, '_blank');
    } else {
      // Show a friendly message
      alert('Resume not available yet. Please contact me directly for my CV!');
    }
  };

  if (isLoading) {
    return (
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-clover-100">
        <div className="container-width text-center">
          <div className="space-y-6">
            <div className="h-48 w-48 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
            <div className="h-12 w-96 max-w-full mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
            <div className="h-6 w-80 max-w-full mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
            <div className="h-16 w-full max-w-2xl mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-clover-100">
        <div className="container-width">
          <ErrorState
            title="Failed to Load Profile"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-clover-100">
      {/* Background Animation - firefly style */}
      <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-10 opacity-95 pointer-events-none z-0" ref={containerRef}>
          {/* Cursor-reactive fireflies */}
          {[...Array(PARTICLE_COUNT)].map((_, i) => {
            // leaf-on-wind / firefly hybrid: smaller vertical range so they stay in the lower hero
            const size = Math.floor(Math.random() * 20) + 14; // 14-34px leaves
            const baseDuration = 18 + Math.random() * 18; // travel duration
            // start across the whole hero section so particles can appear anywhere vertically
            const startTop = 5 + Math.random() * 90; // 5% - 95%
            // gentle upward drift (px) so they move up but remain in lower area
            const verticalDrift = -20 - Math.random() * 40; // -20 .. -60 px
            const flickerDelay = Math.random() * 2;
            const baseOpacity = 0.45 + Math.random() * 0.45;
            const baseScale = 0.6 + Math.random() * 0.8;

            return (
              <div
                key={`leaf-${i}`}
                data-firefly-index={i}
                className="absolute"
                // keep horizontal placement fairly wide, but vertical starts low
                style={{ left: `${10 + Math.random() * 80}%`, top: `${startTop}%`, width: `${size}px`, height: `${size}px`, pointerEvents: 'none' }}
              >
                <motion.div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: `${size}px`,
                    lineHeight: 1,
                    transformOrigin: 'center',
                    color: 'rgba(7,89,60,0.98)',
                    willChange: 'transform, opacity',
                  }}
                  aria-hidden="true"
                  initial={{ y: 0, opacity: 0, scale: baseScale }}
                  animate={{
                    // vertical upward drift only (negative y moves up)
                    y: [0, verticalDrift],
                    // fade in, gently flicker, then fade out to 0 so reset isn't visually abrupt
                    opacity: [0, baseOpacity, baseOpacity * 0.65, 0],
                    // subtle scale pulse
                    scale: [baseScale, baseScale * 1.08, baseScale * 0.94, baseScale],
                  }}
                  transition={{
                    y: { duration: baseDuration * (0.95 + Math.random() * 0.1), repeat: Infinity, ease: 'easeOut', delay: 0 },
                    // opacity lasts a shorter portion of the travel so particles fade faster
                    opacity: { duration: Math.max(1.2, baseDuration * 0.22), repeat: Infinity, ease: 'easeOut', delay: flickerDelay },
                    scale: { duration: Math.max(2, baseDuration * 0.15), repeat: Infinity, ease: 'easeInOut', delay: flickerDelay },
                  }}
                >
                  {/* clover emoji particle */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none select-none"
                    style={{
                      width: '60%',
                      height: '60%',
                      fontSize: 'inherit',
                      lineHeight: 1,
                      transform: 'translateZ(0)',
                      filter: 'drop-shadow(0 6px 18px rgba(16,185,129,0.12))',
                      textShadow: '0 4px 18px rgba(34,197,94,0.25), 0 1px 2px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    🍀
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

  <div className="container-width section-padding pb-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image first in DOM for stacking on small screens; moves to right on lg */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end mb-6 lg:mb-0"
          >
            <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <Image
                src={profile?.profileImage || '/profile-placeholder.svg'}
                alt={`${profile?.name || 'Your Name'} (${profile?.nickname || 'Your Nickname'})`}
                width={320}
                height={320}
                className="w-full h-full object-cover rounded-full"
                priority
                onError={(e) => {
                  // Next/Image uses an <img> under the hood on client; fallback to the placeholder
                  // Ensure we don't loop if placeholder also errors
                  try {
                    if ((e.currentTarget as HTMLImageElement).src?.includes('profile-placeholder.svg')) return;
                    (e.currentTarget as HTMLImageElement).src = '/profile-placeholder.svg';
                  } catch (err) {
                    // ignore
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center lg:justify-start space-x-2 mb-4"
            >
              
              <span className="text-clover-700 font-medium">
                {siteSettings?.hero?.greetingText ?? profile?.greetingText ?? ''}
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 font-playfair whitespace-nowrap"
              style={{ 
                display: 'inline-block',
                maxWidth: '100%',
                fontSize: 'clamp(1.5rem, 8vw, 4.5rem)'
              }}
            >
              <span className="text-gradient text-clover-900">{profile?.name || 'Your Name'}</span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-semibold text-clover-700 mb-6"
            >
              ({profile?.nickname || 'Your Nickname'})
            </motion.h2>

            {/* Title with typing effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <h3 className="text-xl md:text-2xl text-clover-700 font-medium mb-2">
                {profile?.title || 'Yor Position/Title'}
              </h3>
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-clover-500">
                
                <span>{profile?.specialization || 'Your Specialization'}</span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-clover-700 mb-8 max-w-2xl text-justify"
            >
              {profile?.description || 'A passionate 23-year-old Myanmar student studying IT in Thailand. I love creating innovative solutions through programming, embedded systems, and mobile development while mentoring others in their coding journey.'}
            </motion.p>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center lg:justify-start space-x-2 mb-8 text-clover-700"
            >
              <MapPin size={18} />
              <span>{profile?.location || 'Thailand'}</span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <button
                onClick={handleContactClick}
                className="btn-primary group"
              >
                <Mail size={20} className="mr-2 group-hover:rotate-12 transition-transform" />
                {siteSettings?.hero?.contactButtonText || profile?.contactButtonText || 'Get In Touch'}
              </button>
              <button
                onClick={handleWorksClick}
                className="btn-secondary group"
              >
                <Briefcase size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                View My Projects
              </button>
              <button
                onClick={handleResumeDownload}
                disabled={!profile?.cvUrl}
                className={`btn-secondary group ${!profile?.cvUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!profile?.cvUrl ? 'CV not available' : 'Download CV'}
              >
                <Download size={20} className="mr-2 group-hover:translate-y-1 transition-transform" />
                {profile?.cvUrl ? 
                  (siteSettings?.hero?.cvButtonText || profile?.cvButtonText || 'Download CV') : 
                  (siteSettings?.hero?.cvNotAvailableText || profile?.cvNotAvailableText || 'CV Not Available')
                }
              </button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center lg:justify-start space-x-4"
            >
              {/* Only show social links added through admin dashboard */}
              {profile?.socialLinks && profile.socialLinks.length > 0 && (
                profile.socialLinks.map((link, index) => {
                  const iconConfig = getSocialIcon(link.icon);
                  const IconComponent = iconConfig?.icon || Mail;
                  
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-full bg-clover-100 text-clover-700 hover:bg-clover-300 hover:text-clover-900 transition-all duration-200 hover:scale-110 ${iconConfig?.color || ''}`}
                      title={link.name}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + (index * 0.1), type: "spring" }}
                    >
                      <IconComponent size={20} />
                    </motion.a>
                  );
                })
              )}
            </motion.div>
          </motion.div>

          {/* Right column: profile image on desktop, centered above on mobile */}
          
        </div>
      </div>
    </section>
  );
}
