import { Github, Coffee } from 'lucide-react';

export function SocialButtons({ className = '' }) {
  return (
    <div className={`sidebar-support-links ${className}`}>
      <a href="https://github.com/Aerya/Stremosaic" target="_blank" rel="noopener noreferrer" className="sidebar-support-btn" title="Projet GitHub">
        <Github size={14} className="sidebar-support-icon" /><span>GitHub</span>
      </a>
      <a href="https://ko-fi.com/upandclear" target="_blank" rel="noopener noreferrer" className="sidebar-support-btn sidebar-support-donate" title="Soutenir sur Ko-fi">
        <Coffee size={14} className="sidebar-support-icon" /><span>Ko-fi</span>
      </a>
    </div>
  );
}
