import { useState } from 'react';
import { ChevronDown, KeyRound } from 'lucide-react';
import { useCatalog, useTMDBData, useAppActions } from '../../context/AppContext';
import { SearchableSelect } from '../forms/SearchableSelect';

export function GeneralSettingsSection() {
  const { preferences, setPreferences: onPreferencesChange } = useCatalog();
  const { languages = [] } = useTMDBData();
  const actions = useAppActions();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const defaultLanguage = preferences?.defaultLanguage || '';

  const handleLanguageChange = (val) => {
    onPreferencesChange({
      ...preferences,
      defaultLanguage: val,
    });
  };

  return (
    <div className="sidebar-section general-settings" style={{ marginBottom: '12px' }}>
      <div
        className="sidebar-section-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }
        }}
        role="button"
        tabIndex={0}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
        }}
      >
        <span className="sidebar-section-title" style={{ flex: 1, margin: 0 }}>
          Paramètres généraux
        </span>
        <ChevronDown
          size={14}
          className="text-muted"
          style={{
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </div>

      {!isCollapsed && (
        <div style={{ padding: '8px 16px 16px' }}>
          <div className="input-group">
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
                display: 'block',
              }}
            >
              Langue globale d’affichage et des bandes-annonces
            </span>
            <SearchableSelect
              options={languages}
              value={defaultLanguage}
              onChange={handleLanguageChange}
              placeholder="Par défaut (Auto/Français)"
              valueKey="iso_639_1"
              labelKey="english_name"
              aria-label="Langue globale d’affichage et des bandes-annonces"
              renderOption={(opt) => `${opt.english_name} (${opt.name})`}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Remplace la langue pour l’ensemble des catalogues.
            </p>
          </div>

          <div
            className="input-group"
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => actions.handleLogout()}
              style={{ width: '100%', justifyContent: 'center', color: 'var(--text-error)' }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
