import { useState } from 'react';
import { X, Film, Tv, Sparkles } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';
import { getSource } from '../../sources';

const SOURCES = [
  { id: 'tmdb', desc: 'Découverte TMDB avancée', alwaysVisible: true },
  { id: 'anilist', desc: 'Base anime AniList', alwaysVisible: true },
  { id: 'mal', desc: 'Catalogues MyAnimeList', alwaysVisible: true },
  { id: 'kitsu', desc: 'Catalogues anime Kitsu', alwaysVisible: true },
  { id: 'simkl', desc: 'Découverte Simkl', alwaysVisible: true },
  { id: 'bingebase', desc: 'Listes Bingebase', alwaysVisible: true },
  { id: 'mdblist', desc: 'Listes publiques MDBList', alwaysVisible: true },
];

export function NewCatalogModal({ isOpen, onClose, onAdd, imdbEnabled = false }) {
  const [name, setName] = useState('');
  const [source, setSource] = useState('tmdb');
  const [type, setType] = useState('movie');
  const modalRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const enabledFlags = { imdbEnabled };

  const visibleSources = SOURCES.filter((s) => s.alwaysVisible || enabledFlags[s.enabledKey]);

  const currentSource = getSource(source);
  const supportedTypes = currentSource.supportedTypes || ['movie', 'series'];

  const handleSourceSelect = (id) => {
    setSource(id);
    const nextSource = getSource(id);
    const nextTypes = nextSource.supportedTypes || ['movie', 'series'];
    if (!nextTypes.includes(type)) {
      setType(nextTypes[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sourceDescriptor = getSource(source);
    const filters = { ...sourceDescriptor.defaultFilters };
    if (source === 'tmdb' && type === 'collection') {
      filters.listType = 'collection';
      filters.sortBy = 'collection_order';
      delete filters.presetOrigin;
      delete filters.presetDefaults;
    }

    onAdd({
      name: name.trim(),
      type,
      source,
      filters,
      enabled: true,
    });

    setName('');
    setSource('tmdb');
    setType('movie');
    onClose();
  };

  const placeholders = {
    tmdb: 'ex. Science-fiction, Sélection Netflix',
    imdb: 'ex. Gagnants des Oscars, Top IMDb',
    anilist: 'ex. Top Anime, Tendances de la saison',
    mal: 'ex. Top MAL, Anime de saison',
    kitsu: 'ex. Tendances Kitsu, Anime les mieux notés',
    simkl: 'ex. Anime tendances, Meilleurs de 2024',
    bingebase: 'ex. Ma liste Bingebase',
    mdblist: 'ex. Ma liste MDBList',
    trakt: 'ex. Films tendances, Les plus vus',
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Créer un catalogue"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ paddingBottom: '8px' }}>
          <div>
            <h3 className="modal-title">Créer un catalogue</h3>
            <p className="text-secondary" style={{ fontSize: '13px', marginTop: '4px' }}>
              Choisissez une source et un type de contenu
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Source Selector */}
            <div className="filter-group">
              <span className="filter-label">Source</span>
              <div className="source-selector">
                {visibleSources.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`source-pill ${source === s.id ? 'active' : ''}`}
                    onClick={() => handleSourceSelect(s.id)}
                    title={s.desc}
                  >
                    <span className={`source-dot ${s.id}`} />
                    {getSource(s.id).label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type de contenu Toggle */}
            <div className="filter-group" style={{ marginTop: '16px' }}>
              <span className="filter-label">Type de contenu</span>
              <div className="content-type-toggle" style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  className={`type-btn ${type === 'movie' ? 'active' : ''}`}
                  onClick={() => setType('movie')}
                >
                  <Film size={16} />
                  Films
                </button>
                <button
                  type="button"
                  className={`type-btn ${type === 'series' ? 'active' : ''}`}
                  onClick={() => setType('series')}
                >
                  <Tv size={16} />
                  Séries
                </button>
                {supportedTypes.includes('anime') && (
                  <button
                    type="button"
                    className={`type-btn ${type === 'anime' ? 'active' : ''}`}
                    onClick={() => setType('anime')}
                  >
                    <Sparkles size={16} />
                    Anime
                  </button>
                )}
                {source === 'tmdb' && (
                  <button
                    type="button"
                    className={`type-btn ${type === 'collection' ? 'active' : ''}`}
                    onClick={() => setType('collection')}
                  >
                    <Sparkles size={16} />
                    Collections
                  </button>
                )}
              </div>
            </div>

            {/* Nom du catalogue */}
            <div className="filter-group" style={{ marginTop: '16px' }}>
              <label className="filter-label" htmlFor="new-catalog-name">
                Nom du catalogue
              </label>
              <input
                id="new-catalog-name"
                type="text"
                className="input"
                style={{ height: '42px', fontSize: '15px' }}
                placeholder={placeholders[source] || placeholders.tmdb}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Créer le catalogue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
