import { Github } from 'lucide-react';

export function Header({ stats }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.png" alt="Stremosaic" className="logo-image" />
            <div>
              <div className="header-title-row"><h1>Stremo<span className="plus">saic</span></h1></div>
              <span className="logo-subtitle">Catalogues multi-sources pour Stremio</span>
            </div>
          </div>
          {stats && (
            <div className="header-stats">
              <span className="stats-item"><strong>{stats.totalUsers.toLocaleString()}</strong> utilisateurs</span>
              <span className="stats-divider">•</span>
              <span className="stats-item"><strong>{stats.totalCatalogs.toLocaleString()}</strong> catalogues</span>
            </div>
          )}
          <div className="header-actions">
            <a href="https://github.com/Aerya/Stremosaic" target="_blank" rel="noreferrer" className="btn-ghost" title="Projet GitHub">
              <Github size={16} /> GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
