import { Github, Linkedin, Twitter, Instagram, Facebook, Globe, Youtube, MessageCircle, ExternalLink } from 'lucide-react';

export interface SocialIconConfig {
  key: string;
  icon: any;
  label: string;
  color: string;
}

export const socialIcons: SocialIconConfig[] = [
  { key: 'github', icon: Github, label: 'GitHub', color: 'hover:text-gray-900' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:text-navy-600' },
  { key: 'twitter', icon: Twitter, label: 'Twitter/X', color: 'hover:text-navy-400' },
  { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-600' },
  { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:text-navy-600' },
  { key: 'youtube', icon: Youtube, label: 'YouTube', color: 'hover:text-red-600' },
  { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'hover:text-green-600' },
  { key: 'website', icon: Globe, label: 'Website', color: 'hover:text-purple-600' },
  { key: 'external', icon: ExternalLink, label: 'Other', color: 'hover:text-gray-600' }
];

export const getSocialIcon = (iconKey: string) => {
  return socialIcons.find(icon => icon.key === iconKey) || socialIcons.find(icon => icon.key === 'external');
};

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}
