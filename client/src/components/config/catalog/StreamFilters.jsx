import { X } from 'lucide-react';
import { useMemo, useState, memo } from 'react';
import { MultiSelect } from '../../forms/MultiSelect';
import { SearchableSelect } from '../../forms/SearchableSelect';
import { LabelWithTooltip } from '../../forms/Tooltip';

export const StreamFilters = memo(function StreamFilters({
  type,
  tvNetworks,
  watchRegions,
  watchProviders,
  monetizationTypes,
  onNetworkSearch,
  filters,
  onFiltersChange,
  selectedNetworks,
}) {
  const safeWatchRegions = Array.isArray(watchRegions) ? watchRegions : [];
  const safeWatchProviders = Array.isArray(watchProviders) ? watchProviders : [];
  const [providerSearch, setProviderSearch] = useState('');

  const tvNetworkOptions = useMemo(() => tvNetworks || [], [tvNetworks]);

  const handleProviderToggle = (providerId) => {
    const current = filters.watchProviders || [];
    const isActive = current.includes(providerId);
    let next;
    if (isActive) {
      next = current.filter((id) => id !== providerId);
    } else {
      next = [...current, providerId];
    }
    onFiltersChange('watchProviders', next);
  };

  const networkOptions = useMemo(() => {
    const byId = new Map();

    tvNetworkOptions.forEach((n) => {
      if (n && n.id != null) {
        const id = String(n.id);
        const name = n.name || id;
        byId.set(id, { code: id, name });
      }
    });

    (selectedNetworks || []).forEach((n) => {
      if (n && n.id != null) {
        const id = String(n.id);
        const existingName = byId.get(id)?.name;
        const newName = n.name || id;

        const existingIsPlaceholder = existingName === id || !existingName;
        const newIsRealName = newName !== id;

        if (!byId.has(id) || (existingIsPlaceholder && newIsRealName)) {
          byId.set(id, { code: id, name: newName });
        }
      }
    });

    return Array.from(byId.values());
  }, [tvNetworkOptions, selectedNetworks]);

  return (
    <>
      {type === 'series' && tvNetworkOptions.length > 0 && (
        <div className="filter-group mb-4">
          <LabelWithTooltip
            label="Chaînes d’origine"
            tooltip="Filtrer selon la chaîne ou plateforme ayant produit ou diffusé la série à l’origine."
          />
          <span className="filter-label-hint">
            Where the show originally aired (HBO, Netflix Originals, etc.)
          </span>
          <MultiSelect
            options={networkOptions}
            value={(filters.withNetworks || '').split('|').filter(Boolean)}
            onChange={(values) => onFiltersChange('withNetworks', values.join('|'))}
            placeholder="Toutes les chaînes"
            searchPlaceholder="Rechercher des chaînes..."
            onSearch={onNetworkSearch}
            labelKey="name"
            valueKey="code"
            hideUnselected={true}
          />
        </div>
      )}

      <div className="filter-two-col">
        <div className="filter-group">
          <LabelWithTooltip
            label="Votre région"
            tooltip="Choisissez votre pays pour voir les services de streaming disponibles."
          />
          <SearchableSelect
            options={safeWatchRegions.map((r) => ({ code: r.iso_3166_1, name: r.english_name }))}
            value={filters.watchRegion || ''}
            onChange={(value) => onFiltersChange('watchRegion', value)}
            placeholder="Sélectionner votre région"
            searchPlaceholder="Rechercher des régions..."
            labelKey="name"
            valueKey="code"
          />
        </div>
        <div className="filter-group">
          <LabelWithTooltip
            label="Type de disponibilité"
            tooltip="Mode d’accès : Abonnement, Gratuit, Location, Achat."
          />
          <MultiSelect
            options={monetizationTypes}
            value={filters.watchMonetizationTypes || []}
            onChange={(value) => onFiltersChange('watchMonetizationTypes', value)}
            placeholder="Tous"
            labelKey="label"
            valueKey="value"
          />
        </div>
      </div>

      <div className="mt-4">
        <LabelWithTooltip
          label="Services de streaming"
          tooltip="Filtrer par plateformes de streaming spécifiques."
        />
        <span className="filter-label-hint">
          {filters.watchRegion && safeWatchProviders.length > 0
            ? 'Disponible actuellement dans votre région'
            : 'Sélectionnez votre région pour voir les services disponibles'}
        </span>
        {filters.watchRegion && safeWatchProviders.length > 0 ? (
          <>
            <div className="provider-search">
              <input
                type="text"
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                placeholder="Rechercher des services de streaming..."
                className="provider-search-input"
              />
              {providerSearch && (
                <button
                  type="button"
                  className="provider-search-clear"
                  onClick={() => setProviderSearch('')}
                  aria-label="Effacer la recherche de service"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="provider-grid-wrap">
              <div className="provider-grid">
                {(() => {
                  const filtered = providerSearch
                    ? safeWatchProviders.filter((p) =>
                        p?.name?.toLowerCase().includes(providerSearch.trim().toLowerCase())
                      )
                    : safeWatchProviders;

                  if (filtered.length === 0) {
                    return (
                      <div className="filter-hint provider-no-results">
                        No streaming services match your search.
                      </div>
                    );
                  }

                  return filtered.map((provider) => (
                    <div
                      key={provider.id}
                      className={`provider-item ${(filters.watchProviders || []).includes(provider.id) ? 'selected' : ''}`}
                      role="checkbox"
                      aria-checked={(filters.watchProviders || []).includes(provider.id)}
                      tabIndex={0}
                      onClick={() => handleProviderToggle(provider.id)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleProviderToggle(provider.id);
                        }
                      }}
                    >
                      {provider.logo ? (
                        <img src={provider.logo} alt={provider.name} className="provider-logo" />
                      ) : (
                        <div className="provider-logo provider-logo-placeholder" />
                      )}
                      <span className="provider-name">{provider.name}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </>
        ) : (
          <div className="filter-hint mt-2">
            Choose a region above to see streaming services available in that area
          </div>
        )}
      </div>
    </>
  );
});
