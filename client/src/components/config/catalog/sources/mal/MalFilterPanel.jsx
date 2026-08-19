import { useMemo, useCallback } from 'react';
import { Settings, Calendar, Sparkles, Layers, Star } from 'lucide-react';
import { FilterSection } from '../../FilterSection';
import { GenreSelector } from '../../GenreSelector';
import { AnimeSeasonSelector } from '../../shared/AnimeSeasonSelector';
import { AnimeFormatSelector } from '../../shared/AnimeFormatSelector';
import { StremioExtras } from '../../StremioExtras';
import { SearchableSelect } from '../../../../forms/SearchableSelect';
import { RangeSlider } from '../../../../forms/RangeSlider';
import { LabelWithTooltip } from '../../../../forms/Tooltip';

const MAL_SEASON_OPTIONS = [
  { value: 'winter', label: 'Winter' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
];

export function MalFilterPanel({
  localCatalog,
  onFiltersChange,
  expandedSections,
  onToggleSection,
  malGenres = [],
  malRankingTypes = [],
  malSortOptions = [],
  malOrderByOptions = [],
  malMediaTypes = [],
  malStatuses = [],
  malRatings = [],
}) {
  const filters = localCatalog?.filters || {};
  const type = localCatalog?.type || 'movie';

  const availableMediaTypes = useMemo(() => {
    if (type === 'movie')
      return malMediaTypes.filter((m) => m.value === 'movie' || m.value === 'special');
    return malMediaTypes.filter((m) => m.value !== 'movie');
  }, [malMediaTypes, type]);

  const availableRankingTypes = useMemo(() => {
    if (type === 'anime') return malRankingTypes;
    if (type === 'movie')
      return malRankingTypes.filter((r) => !['all', 'tv', 'airing', 'upcoming'].includes(r.value));
    return malRankingTypes.filter((r) => !['all', 'movie'].includes(r.value));
  }, [malRankingTypes, type]);

  const rankingValue = useMemo(() => {
    const current = filters.malRankingType || 'all';
    if (type === 'anime') return current;
    if (current === 'all') return type === 'movie' ? 'movie' : 'tv';
    return current;
  }, [filters.malRankingType, type]);

  const malGenreObjects = useMemo(
    () => malGenres.map((g) => ({ id: g.id, name: g.name })),
    [malGenres]
  );

  const handleScoreChange = useCallback(
    ([min, max]) => {
      onFiltersChange('malScoreMin', min > 0 ? min : undefined);
      onFiltersChange('malScoreMax', max < 10 ? max : undefined);
    },
    [onFiltersChange]
  );

  const getRankingBadge = () => (rankingValue && rankingValue !== 'all' ? 1 : 0);

  const getGenreBadge = () =>
    (filters.malGenres || []).length + (filters.malExcludeGenres || []).length;

  const getSeasonBadge = () => {
    let count = 0;
    if (filters.malSeason) count++;
    if (filters.malSeasonYear) count++;
    if (filters.malSort && filters.malSort !== 'anime_num_list_users') count++;
    return count;
  };

  const getFormatBadge = () => {
    let count = 0;
    if ((filters.malMediaType || []).length > 0) count++;
    if ((filters.malStatus || []).length > 0) count++;
    if (filters.malRating) count++;
    return count;
  };

  const getScoreBadge = () => {
    let count = 0;
    if (filters.malScoreMin) count++;
    if (filters.malScoreMax) count++;
    if (filters.malOrderBy) count++;
    return count;
  };

  const hasAdvancedFilters =
    (filters.malGenres || []).length > 0 ||
    (filters.malExcludeGenres || []).length > 0 ||
    (filters.malStatus || []).length > 0 ||
    (filters.malMediaType || []).length > 0 ||
    filters.malRating ||
    (filters.malScoreMin != null && filters.malScoreMin > 0) ||
    (filters.malScoreMax != null && filters.malScoreMax < 10) ||
    filters.malOrderBy;

  return (
    <>
      {!hasAdvancedFilters && (
        <FilterSection
          id="ranking"
          title="Classement"
          description="Choisir un type de classement MAL"
          icon={Settings}
          isOpen={expandedSections?.ranking}
          onToggle={onToggleSection}
          badgeCount={getRankingBadge()}
        >
          <div className="filter-grid">
            <div className="filter-group">
              <LabelWithTooltip
                label="Type de classement"
                tooltip="Sélectionner un classement MAL. Désactivé lorsque des filtres avancés sont utilisés."
              />
              <SearchableSelect
                options={availableRankingTypes}
                value={rankingValue}
                onChange={(value) => onFiltersChange('malRankingType', value)}
                placeholder="Tous"
                searchPlaceholder="Rechercher..."
                labelKey="label"
                valueKey="value"
                allowClear={false}
              />
            </div>
          </div>
        </FilterSection>
      )}

      <FilterSection
        id="genres"
        title="Genres"
        description="Sélectionner les genres à inclure ou exclure"
        icon={Sparkles}
        isOpen={expandedSections?.genres}
        onToggle={onToggleSection}
        badgeCount={getGenreBadge()}
      >
        <GenreSelector
          genres={malGenreObjects}
          selectedGenres={filters.malGenres || []}
          excludedGenres={filters.malExcludeGenres || []}
          genreMatchMode="any"
          onInclude={(genreId) => {
            const current = filters.malGenres || [];
            const excluded = filters.malExcludeGenres || [];
            if (current.includes(genreId)) {
              onFiltersChange(
                'malGenres',
                current.filter((g) => g !== genreId)
              );
            } else if (excluded.includes(genreId)) {
              onFiltersChange(
                'malExcludeGenres',
                excluded.filter((g) => g !== genreId)
              );
            } else {
              onFiltersChange('malGenres', [...current, genreId]);
            }
          }}
          onExclude={(genreId) => {
            const current = filters.malGenres || [];
            const excluded = filters.malExcludeGenres || [];
            if (excluded.includes(genreId)) {
              onFiltersChange(
                'malExcludeGenres',
                excluded.filter((g) => g !== genreId)
              );
            } else {
              onFiltersChange(
                'malGenres',
                current.filter((g) => g !== genreId)
              );
              onFiltersChange('malExcludeGenres', [...excluded, genreId]);
            }
          }}
          onClear={(genreId) => {
            onFiltersChange(
              'malGenres',
              (filters.malGenres || []).filter((g) => g !== genreId)
            );
            onFiltersChange(
              'malExcludeGenres',
              (filters.malExcludeGenres || []).filter((g) => g !== genreId)
            );
          }}
          onSetMatchMode={() => {}}
          showMatchMode={false}
          loading={false}
          onRefresh={() => {}}
        />
        {hasAdvancedFilters && (
          <p className="text-secondary" style={{ fontSize: '11px', marginTop: '6px' }}>
            Using advanced browse mode. Ranking type is ignored.
          </p>
        )}
      </FilterSection>

      <FilterSection
        id="format"
        title="Type et statut"
        description="Type de média, statut de diffusion et classification"
        icon={Layers}
        isOpen={expandedSections?.format}
        onToggle={onToggleSection}
        badgeCount={getFormatBadge()}
      >
        {availableMediaTypes.length > 0 && (
          <div className="filter-group">
            <LabelWithTooltip
              label="Type de média"
              tooltip="Filtrer selon le type de média : TV, film, OVA, ONA, spécial, musique."
            />
            <AnimeFormatSelector
              selected={filters.malMediaType || []}
              options={availableMediaTypes}
            />
          </div>
        )}

        {malStatuses.length > 0 && (
          <div className="filter-group">
            <LabelWithTooltip
              label="Statut"
              tooltip="Filtrer selon le statut : en diffusion, terminé, à venir."
            />
            <AnimeFormatSelector
              selected={filters.malStatus || []}
              options={malStatuses}
              onChange={(statuses) => onFiltersChange('malStatus', statuses)}
            />
          </div>
        )}

        {malRatings.length > 0 && (
          <div className="filter-group">
            <LabelWithTooltip
              label="Classification du contenu"
              tooltip="Filtrer selon la classification : G, PG, PG-13, R, R+."
            />
            <SearchableSelect
              options={malRatings}
              value={filters.malRating || ''}
              onChange={(val) => onFiltersChange('malRating', val || undefined)}
              placeholder="Toutes les classifications"
              searchPlaceholder="Rechercher..."
              labelKey="label"
              valueKey="value"
            />
          </div>
        )}
      </FilterSection>

      {type === 'series' && (
        <FilterSection
          id="season"
          title="Saison"
          description="Filtrer selon la saison et l’année de l’anime"
          icon={Calendar}
          isOpen={expandedSections?.season}
          onToggle={onToggleSection}
          badgeCount={getSeasonBadge()}
        >
          <div className="filter-grid">
            <div className="filter-group">
              <LabelWithTooltip
                label="Anime saisonnier"
                tooltip="Filtrer selon la saison. Lorsqu’une saison est sélectionnée, le classement et les filtres avancés sont ignorés."
              />
              <AnimeSeasonSelector
                season={filters.malSeason}
                year={filters.malSeasonYear}
                onSeasonChange={(val) => onFiltersChange('malSeason', val)}
                onYearChange={(val) => onFiltersChange('malSeasonYear', val)}
                seasonOptions={MAL_SEASON_OPTIONS}
              />
              <p className="text-secondary" style={{ fontSize: '11px', marginTop: '6px' }}>
                Lorsqu’une saison est sélectionnée, le classement et les filtres de navigation sont ignorés.
              </p>
            </div>

            {filters.malSeason && filters.malSeasonYear && (
              <div className="filter-group">
                <LabelWithTooltip label="Tri" tooltip="Définir le tri des résultats saisonniers." />
                <SearchableSelect
                  options={malSortOptions}
                  value={filters.malSort || 'anime_num_list_users'}
                  onChange={(value) => onFiltersChange('malSort', value)}
                  placeholder="Plus ajoutés aux listes"
                  searchPlaceholder="Rechercher..."
                  labelKey="label"
                  valueKey="value"
                  allowClear={false}
                />
              </div>
            )}
          </div>
        </FilterSection>
      )}

      <FilterSection
        id="score"
        title="Score & Tri"
        description="Filtrer selon la note et trier les résultats"
        icon={Star}
        isOpen={expandedSections?.score}
        onToggle={onToggleSection}
        badgeCount={getScoreBadge()}
      >
        <RangeSlider
          label="Tranche de score"
          min={0}
          max={10}
          step={0.5}
          value={[filters.malScoreMin || 0, filters.malScoreMax || 10]}
          onChange={handleScoreChange}
        />

        <div className="filter-spacer" />

        {malOrderByOptions.length > 0 && (
          <div className="filter-group">
            <LabelWithTooltip
              label="Trier par"
              tooltip="Définir l’ordre des résultats. S’applique uniquement aux filtres avancés."
            />
            <SearchableSelect
              options={malOrderByOptions}
              value={filters.malOrderBy || ''}
              onChange={(val) => onFiltersChange('malOrderBy', val || undefined)}
              placeholder="Score (par défaut)"
              searchPlaceholder="Rechercher..."
              labelKey="label"
              valueKey="value"
            />
          </div>
        )}
      </FilterSection>

      <FilterSection
        id="extras"
        title="Stremio Extras"
        description="Afficher les filtres déroulants dans Stremio"
        icon={Layers}
        isOpen={expandedSections?.extras}
        onToggle={onToggleSection}
        badgeCount={(filters.stremioExtras || []).length}
      >
        <StremioExtras
          localCatalog={localCatalog}
          onFiltersChange={onFiltersChange}
          availableModes={['genre']}
        />
      </FilterSection>
    </>
  );
}
