import {
  Plus,
  Film,
  Tv,
  TrendingUp,
  Flame,
  Calendar,
  Star,
  Play,
  Radio,
  Sparkles,
  ChevronDown,
  Trophy,
  Award,
  Settings,
  Heart,
} from 'lucide-react';
import { SocialButtons } from '../social/SocialButtons.jsx';
import { useState, useEffect, lazy, Suspense, memo } from 'react';

import { useIsMobile } from '../../hooks/useIsMobile';
import { createId } from '../../utils/id';
import { useCatalog, useTMDBData, useAppActions } from '../../context/AppContext';
import { CatalogListSkeleton } from '../layout/Skeleton';
import { SettingsModal } from '../modals/SettingsModal';
import { ImportSelectModal } from '../modals/ImportSelectModal';
import { ExportSelectModal } from '../modals/ExportSelectModal';

const DraggableCatalogList = lazy(() =>
  import('./DraggableCatalogList').then((m) => ({ default: m.DraggableCatalogList }))
);

const presetIcons = {
  trending_day: Flame,
  trending_week: TrendingUp,
  now_playing: Play,
  upcoming: Calendar,
  airing_today: Radio,
  on_the_air: Radio,
  top_rated: Star,
  popular: Sparkles,
};

const PRESET_LABELS_FR = {
  trending_day: "Tendances du jour",
  trending_week: "Tendances de la semaine",
  now_playing: "Actuellement au cinéma",
  upcoming: "Prochainement",
  airing_today: "Diffusées aujourd'hui",
  on_the_air: "En cours de diffusion",
  top_rated: "Les mieux notés",
  popular: "Populaires",
};

const getPresetLabelFr = (preset) =>
  PRESET_LABELS_FR[preset?.value] ||
  String(preset?.label || "").replace(/^[^\s]+\s/, "");

const FRENCH_STREAMING_PRESETS = [
  { id: "netflix-fr", label: "Netflix", aliases: ["Netflix"] },
  { id: "canal-fr", label: "Canal+", aliases: ["Canal+", "CANAL+", "Canal Plus"] },
  { id: "disney-fr", label: "Disney+", aliases: ["Disney Plus", "Disney+"] },
  { id: "prime-fr", label: "Prime Video", aliases: ["Amazon Prime Video", "Prime Video"] },
  { id: "max-fr", label: "Max", aliases: ["Max"] },
  { id: "apple-fr", label: "Apple TV+", aliases: ["Apple TV Plus", "Apple TV+"] },
  { id: "paramount-fr", label: "Paramount+", aliases: ["Paramount Plus", "Paramount+"] },
  { id: "crunchyroll-fr", label: "Crunchyroll", aliases: ["Crunchyroll"] },
  { id: "francetv-fr", label: "France.tv", aliases: ["France TV", "France.tv"] },
  { id: "arte-fr", label: "ARTE", aliases: ["Arte", "ARTE"] },
  { id: "mubi-fr", label: "MUBI", aliases: ["MUBI"] },
];

function normalizeProvider(provider) {
  if (!provider || typeof provider !== 'object') return null;
  const id = provider.provider_id ?? provider.id;
  const name = provider.provider_name ?? provider.name;
  if (id == null || !name) return null;
  return { ...provider, id: Number(id), name: String(name).trim() };
}

function findProvider(providers, aliases) {
  const normalized = (Array.isArray(providers) ? providers : [])
    .map(normalizeProvider)
    .filter(Boolean)
    .map((provider) => ({
      ...provider,
      _name: provider.name.toLocaleLowerCase('fr-FR'),
    }));

  for (const alias of aliases) {
    const wanted = alias.toLocaleLowerCase('fr-FR');
    const exact = normalized.find((provider) => provider._name === wanted);
    if (exact) return exact;
  }

  for (const alias of aliases) {
    const wanted = alias.toLocaleLowerCase('fr-FR');
    const partial = normalized.find(
      (provider) =>
        provider._name.includes(wanted) ||
        (wanted.length >= 4 && wanted.includes(provider._name))
    );
    if (partial) return partial;
  }

  return null;
}

export const CatalogSidebar = memo(function CatalogSidebar() {
  const {
    catalogs,
    activeCatalog,
    setActiveCatalog: onSelectCatalog,
    globalSource,
    setGlobalSource,
    configName,
    setConfigName: onConfigNameChange,
    preferences,
    handleAddPresetCatalog: onAddPresetCatalog,
    handleDeleteCatalog: onDeleteCatalog,
    handleDuplicateCatalog: onDuplicateCatalog,
    handleImportConfig: onImportConfig,
    setCatalogs,
  } = useCatalog();
  const {
    presetCatalogs = { movie: [], series: [] },
    imdbPresetCatalogs = [],
    imdbEnabled = false,
    getWatchProviders,
    
  } = useTMDBData();
  const { addToast, setShowNewCatalogModal } = useAppActions();

  const onAddCatalog = () => setShowNewCatalogModal(true);
  const handleAddFrenchStreamingPreset = async (service) => {
    if (typeof getWatchProviders !== 'function') {
      addToast?.('Providers TMDB indisponibles', 'error');
      return;
    }

    try {
      const [movieProviders, seriesProviders] = await Promise.all([
        getWatchProviders('movie', 'FR'),
        getWatchProviders('series', 'FR'),
      ]);

      const targets = [
        ['movie', findProvider(movieProviders, service.aliases)],
        ['series', findProvider(seriesProviders, service.aliases)],
      ].filter(([, provider]) => provider?.id != null);

      if (targets.length === 0) {
        addToast?.(`${service.label} : aucun fournisseur TMDB trouvé pour la France`, 'error');
        return;
      }

      const newCatalogs = targets
        .filter(([type]) => !safeCatalogs.some(
          (catalog) =>
            catalog?.type === type &&
            catalog?.filters?.servicePreset === service.id
        ))
        .map(([type, provider]) => ({
          _id: createId(),
          name: `${service.label} FR - ${type === 'movie' ? 'Films' : 'Séries'}`,
          type,
          source: 'tmdb',
          enabled: true,
          filters: {
            listType: 'discover',
            sortBy: 'popularity.desc',
            watchRegion: 'FR',
            watchProviders: [provider.id],
            watchMonetizationTypes: ['flatrate'],
            servicePreset: service.id,
          },
        }));

      if (newCatalogs.length === 0) {
        addToast?.(`${service.label} FR est déjà ajouté`);
        return;
      }

      setCatalogs((previous) => [...previous, ...newCatalogs]);
      onSelectCatalog?.(newCatalogs[0]);

      addToast?.(
        `${service.label} FR : ${newCatalogs.length} catalogue${newCatalogs.length > 1 ? 's' : ''} ajouté${newCatalogs.length > 1 ? 's' : ''}`
      );
    } catch (error) {
      console.error('Ajout rapide Streaming FR:', error);
      addToast?.(
        `Impossible d'ajouter ${service.label} FR : ${error?.message || 'erreur inconnue'}`,
        'error'
      );
    }
  };

  const onReorderCatalogs = (nextCatalogs) => {
    setCatalogs(nextCatalogs);
  };
  const safeCatalogs = Array.isArray(catalogs) ? catalogs : [];
  const safePresetCatalogs =
    presetCatalogs && typeof presetCatalogs === 'object' && !Array.isArray(presetCatalogs)
      ? presetCatalogs
      : { movie: [], series: [] };
  const isMobile = useIsMobile();
  const [moviePresetsCollapsed, setMoviePresetsCollapsed] = useState(isMobile);
  const [tvPresetsCollapsed, setTvPresetsCollapsed] = useState(isMobile);
  const [importData, setImportData] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState('data');

  useEffect(() => {
    setMoviePresetsCollapsed(isMobile);
    setTvPresetsCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const handleOpenPreferences = (event) => {
      const requestedSection = event?.detail?.section;
      setSettingsInitialSection(
        typeof requestedSection === 'string' && requestedSection.length > 0
          ? requestedSection
          : 'data'
      );
      setShowSettingsModal(true);
    };

    window.addEventListener('open-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('open-preferences', handleOpenPreferences);
    };
  }, []);

  // Sync global source if active catalog changes
  useEffect(() => {
    if (activeCatalog?.source) {
      if (activeCatalog.source !== globalSource) {
        setGlobalSource(activeCatalog.source);
      }
    }
  }, [activeCatalog, globalSource, setGlobalSource]);

  const getCatalogKey = (catalog) => String(catalog?._id || catalog?.id || catalog?.name);

  const getPlaceholder = () => {
    if (safeCatalogs.length > 0 && safeCatalogs[0].name) {
      return safeCatalogs[0].name;
    }
    return 'Configuration sans titre';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-actions">
          <div className="config-name-wrapper">
            <input
              type="text"
              className="config-name-input"
              value={configName}
              onChange={(e) => onConfigNameChange && onConfigNameChange(e.target.value)}
              placeholder={getPlaceholder()}
            />
          </div>
          <button
            className="btn btn-primary btn-sm sidebar-add-btn"
            onClick={onAddCatalog}
            title="Ajouter un catalogue personnalisé"
          >
            <Plus size={16} /> <span>Nouveau catalogue</span>
          </button>
          <button
            className="btn btn-secondary btn-sm sidebar-settings-btn"
            onClick={() => {
              setSettingsInitialSection('data');
              setShowSettingsModal(true);
            }}
            aria-label="Paramètres"
            title="Préférences globales"
          >
            <Settings size={16} />
            <span className="settings-text">Préférences</span>
          </button>
        </div>
      </div>

      <div className="sidebar-support sidebar-support--top">
        <SocialButtons />
      </div>

      <div className="catalog-list">
        {safeCatalogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Film size={32} />
            </div>
            <p>Aucun catalogue</p>
            <p className="text-sm">Ajoutez un catalogue personnalisé ou utilisez les presets ci-dessous</p>
          </div>
        ) : (
          <Suspense fallback={<CatalogListSkeleton count={safeCatalogs.length || 3} />}>
            <DraggableCatalogList
              catalogs={safeCatalogs}
              activeCatalog={activeCatalog}
              onSelectCatalog={onSelectCatalog}
              onDeleteCatalog={onDeleteCatalog}
              onDuplicateCatalog={onDuplicateCatalog}
              onReorderCatalogs={onReorderCatalogs}
              getCatalogKey={getCatalogKey}
            />
          </Suspense>
        )}
      </div>

      <div className="sidebar-section">
        <h4 className="sidebar-section-title">Ajout rapide</h4>

        {imdbEnabled && (
          <div className="source-tabs" style={{ marginBottom: '12px' }}>
            <button
              type="button"
              className={`source-tab ${globalSource === 'tmdb' ? 'active tmdb' : ''}`}
              onClick={() => setGlobalSource('tmdb')}
            >
              <Film size={14} /> TMDB
            </button>
            <button
              type="button"
              className={`source-tab ${globalSource === 'imdb' ? 'active imdb' : ''}`}
              onClick={() => setGlobalSource('imdb')}
            >
              <Award size={14} /> IMDb
            </button>
          </div>
        )}

        {/* Unified Movie Presets */}
        <div className={`preset-group ${moviePresetsCollapsed ? 'collapsed' : ''}`}>
          <div
            className="preset-group-header"
            onClick={() => setMoviePresetsCollapsed(!moviePresetsCollapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMoviePresetsCollapsed(!moviePresetsCollapsed);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Film size={14} />
            <span>Films</span>
            <ChevronDown size={14} className="chevron" />
          </div>
          <div className="preset-list">
            {(globalSource === 'tmdb'
              ? safePresetCatalogs.movie || []
              : imdbPresetCatalogs.filter((p) => p.type === 'movie')
            ).map((preset) => {
              const source = globalSource === 'tmdb' ? 'tmdb' : 'imdb';
              const type = 'movie';
              const isAdded = safeCatalogs.some(
                (c) =>
                  (source === 'imdb' ? c.source === 'imdb' : !c.source || c.source === 'tmdb') &&
                  (c.filters?.listType === preset.value ||
                    c.filters?.presetOrigin === preset.value) &&
                  c.type === type
              );
              const IconComponent =
                presetIcons[preset.value] ||
                (source === 'imdb' && preset.value === 'top250' ? Trophy : Star);

              return (
                <button
                  key={`${source}-${preset.value}`}
                  className={`preset-item ${source === 'imdb' ? 'preset-item--imdb' : ''} ${isAdded ? 'added' : ''}`}
                  onClick={() => !isAdded && onAddPresetCatalog(type, { ...preset, label: getPresetLabelFr(preset) }, source)}
                  disabled={isAdded}
                  title={isAdded ? 'Déjà ajouté' : preset.description}
                >
                  <IconComponent size={14} />
                  <span>{getPresetLabelFr(preset)}</span>
                  {!isAdded && <Plus size={14} className="preset-add-icon" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unified TV Presets */}
        <div className={`preset-group ${tvPresetsCollapsed ? 'collapsed' : ''}`}>
          <div
            className="preset-group-header"
            onClick={() => setTvPresetsCollapsed(!tvPresetsCollapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTvPresetsCollapsed(!tvPresetsCollapsed);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Tv size={14} />
            <span>Séries</span>
            <ChevronDown size={14} className="chevron" />
          </div>
          <div className="preset-list">
            {(globalSource === 'tmdb'
              ? safePresetCatalogs.series || []
              : imdbPresetCatalogs.filter((p) => p.type === 'series')
            ).map((preset) => {
              const source = globalSource === 'tmdb' ? 'tmdb' : 'imdb';
              const type = 'series';
              const isAdded = safeCatalogs.some(
                (c) =>
                  (source === 'imdb' ? c.source === 'imdb' : !c.source || c.source === 'tmdb') &&
                  (c.filters?.listType === preset.value ||
                    c.filters?.presetOrigin === preset.value) &&
                  c.type === type
              );
              const IconComponent =
                presetIcons[preset.value] ||
                (source === 'imdb' && preset.value === 'top250' ? Trophy : Star);

              return (
                <button
                  key={`${source}-${preset.value}`}
                  className={`preset-item ${source === 'imdb' ? 'preset-item--imdb' : ''} ${isAdded ? 'added' : ''}`}
                  onClick={() => !isAdded && onAddPresetCatalog(type, { ...preset, label: getPresetLabelFr(preset) }, source)}
                  disabled={isAdded}
                  title={isAdded ? 'Déjà ajouté' : preset.description}
                >
                  <IconComponent size={14} />
                  <span>{getPresetLabelFr(preset)}</span>
                  {!isAdded && <Plus size={14} className="preset-add-icon" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="preset-group preset-group--streaming-fr">
          <div className="preset-group-header" role="heading" aria-level="5">
            <Play size={14} />
            <span>Streaming FR</span>
          </div>
          <div className="preset-list">
            {FRENCH_STREAMING_PRESETS.map((service) => {
              const movieAdded = safeCatalogs.some(
                (catalog) =>
                  catalog?.type === "movie" &&
                  catalog?.filters?.servicePreset === service.id
              );
              const seriesAdded = safeCatalogs.some(
                (catalog) =>
                  catalog?.type === "series" &&
                  catalog?.filters?.servicePreset === service.id
              );
              const fullyAdded = movieAdded && seriesAdded;
              return (
                <button
                  key={service.id}
                  type="button"
                  className={`preset-item ${fullyAdded ? "added" : ""}`}
                  onClick={() => !fullyAdded && handleAddFrenchStreamingPreset(service)}
                  disabled={fullyAdded}
                >
                  <Play size={14} />
                  <span>{service.label} FR</span>
                  {!fullyAdded && <Plus size={14} className="preset-add-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showImportModal && importData && (
        <ImportSelectModal
          isOpen={showImportModal}
          data={importData}
          onClose={() => {
            setShowImportModal(false);
            setImportData(null);
          }}
          onConfirm={(selectedData) => {
            if (onImportConfig) onImportConfig(selectedData);
            setShowImportModal(false);
            setImportData(null);
          }}
        />
      )}
      {showExportModal && (
        <ExportSelectModal
          isOpen={showExportModal}
          catalogs={safeCatalogs}
          configName={configName}
          preferences={preferences}
          onClose={() => setShowExportModal(false)}
          onConfirm={(exportData) => {
            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${(configName || 'stremio_config').replace(/\s+/g, '_')}_export.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setShowExportModal(false);
            if (addToast) addToast('Configuration exportée avec succès');
          }}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onShowExport={setShowExportModal}
          initialSection={settingsInitialSection}
          onImportData={(data) => {
            setImportData(data);
            setShowImportModal(true);
          }}
        />
      )}
    </aside>
  );
});
