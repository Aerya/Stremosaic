import { Github, Coffee, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="aerya-footer">
      <div className="container aerya-footer-inner">
        <div className="aerya-footer-author">
          <img src="https://github.com/Aerya.png" alt="Avatar Aerya" className="aerya-footer-avatar" />
          <span>Stremosaic par <strong>Aerya</strong> ❤️</span>
        </div>
        <div className="aerya-footer-links">
          <a href="https://github.com/Aerya/Stremosaic" target="_blank" rel="noreferrer"><Github size={15}/> GitHub</a>
          <a href="https://upandclear.org" target="_blank" rel="noreferrer"><Globe size={15}/> Blog</a>
          <a href="https://ko-fi.com/upandclear" target="_blank" rel="noreferrer"><Coffee size={15}/> Ko-fi</a>
        </div>
      </div>
    </footer>
  );
}
