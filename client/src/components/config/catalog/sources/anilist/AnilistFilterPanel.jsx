import { useMemo, useCallback, useState } from 'react';
import {
  Settings,
  Sparkles,
  Calendar,
  Star,
  Globe,
  Eye,
  Tag,
  Clock,
  Building,
  Layers,
} from 'lucide-react';
import { FilterSection } from '../../FilterSection';
import { GenreSelector } from '../../GenreSelector';
import { AnimeSeasonSelector } from '../../shared/AnimeSeasonSelector';
import { AnimeFormatSelector } from '../../shared/AnimeFormatSelector';
import { StremioExtras } from '../../StremioExtras';
import { SearchableSelect } from '../../../../forms/SearchableSelect';
import { MultiSelect } from '../../../../forms/MultiSelect';
import { RangeSlider, SingleSlider } from '../../../../forms/RangeSlider';
import { LabelWithTooltip } from '../../../../forms/Tooltip';
import { SearchInput } from '../../../../forms/SearchInput';
import { api } from '../../../../../services/api';

import { Checkbox } from '../../../../forms/Checkbox';

export function AnilistFilterPanel({
  localCatalog,
  onFiltersChange,
  expandedSections,
  onToggleSection,
  handleTriStateGenreClick,
  anilistGenres = [],
  anilistTags = [],
  anilistSortOptions = [],
  anilistFormatOptions = [],
  anilistStatusOptions = [],
  anilistSeasonOptions = [],
  anilistSourceOptions = [],
  anilistCountryOptions = [],
}) {
  const filters = localCatalog?.filters || {};
  const type = localCatalog?.type || 'movie';
  const formSelectedStudios = localCatalog?.formState?.selectedStudios;
  const filterStudioIds = filters.studios;

  const [studioLabelById, setStudioLabelById] = useState(() => {
    const initial = {};
    const initialSelected = Array.isArray(localCatalog?.formState?.selectedStudios)
      ? localCatalog.formState.selectedStudios
      : [];
    for (const studio of initialSelected) {
      if (studio?.id != null && studio?.name) {
        initial[Number(studio.id)] = studio.name;
      }
    }
    return initial;
  });

  const searchAnilistStudios = useCallback(async (query) => {
    return api.searchAnilistStudios(query);
  }, []);

  const selectedStudios = useMemo(() => {
    if (Array.isArray(formSelectedStudios)) {
      return formSelectedStudios
        .filter((studio) => studio && studio.id != null)
        .map((studio) => ({
          id: Number(studio.id),
          name: studio.name || studioLabelById[Number(studio.id)] || `Studio #${studio.id}`,
        }));
    }

    if (Array.isArray(filterStudioIds) && filterStudioIds.length > 0) {
      return filterStudioIds
        .filter((id) => Number.isInteger(id) && id > 0)
        .map((id) => ({ id, name: studioLabelById[id] || `Studio #${id}` }));
    }

    return [];
  }, [formSelectedStudios, filterStudioIds, studioLabelById]);

  const handleStudiosChange = useCallback(
    (nextSelected) => {
      const updated = Array.isArray(nextSelected)
        ? nextSelected.filter((s) => s && s.id != null)
        : [];
      setStudioLabelById((prev) => {
        const next = { ...prev };
        for (const studio of updated) {
          const id = Number(studio.id);
          if (Number.isInteger(id) && id > 0 && studio.name) {
            next[id] = studio.name;
          }
        }
        return next;
      });
      const studioIds = updated
        .map((s) => Number(s.id))
        .filter((id) => Number.isInteger(id) && id > 0);
      onFiltersChange('studios', studioIds.length > 0 ? studioIds : undefined);
    },
    [onFiltersChange]
  );

  const anilistGenreObjects = useMemo(
    () => anilistGenres.map((g) => ({ id: g, name: g })),
    [anilistGenres]
  );

  const availableFormatOptions = useMemo(() => {
    if (type === 'anime') {
      return anilistFormatOptions;
    }
    if (type === 'movie') {
      return anilistFormatOptions.filter((f) => f.value === 'MOVIE' || f.value === 'SPECIAL');
    }
    return anilistFormatOptions.filter((f) => f.value !== 'MOVIE');
  }, [anilistFormatOptions, type]);

  const anilistTagObjects = useMemo(
    () =>
      anilistTags.map((t) =>
        typeof t === 'string' ? { value: t, label: t } : { value: t.value, label: t.label }
      ),
    [anilistTags]
  );

  const countrySelectOptions = useMemo(
    () => anilistCountryOptions.map((c) => ({ value: c.value, label: c.label })),
    [anilistCountryOptions]
  );

  const handleScoreChange = useCallback(
    ([min, max]) => {
      onFiltersChange('averageScoreMin', min > 0 ? min : undefined);
      onFiltersChange('averageScoreMax', max < 100 ? max : undefined);
    },
    [onFiltersChange]
  );

  const handleEpisodeChange = useCallback(
    ([min, max]) => {
      onFiltersChange('episodesMin', min > 0 ? min : undefined);
      onFiltersChange('episodesMax', max < 150 ? max : undefined);
    },
    [onFiltersChange]
  );

  const handleDurationChange = useCallback(
    ([min, max]) => {
      onFiltersChange('durationMin', min > 0 ? min : undefined);
      onFiltersChange('durationMax', max < 180 ? max : undefined);
    },
    [onFiltersChange]
  );

  const getSortBadge = () => {
    let count = 0;
    if (filters.sortBy && filters.sortBy !== 'TRENDING_DESC') count++;
    if ((filters.format || []).length > 0) count++;
    if ((filters.status || []).length > 0) count++;
    return count;
  };

  const getGenreBadge = () => (filters.genres || []).length + (filters.excludeGenres || []).length;

  const getTagBadge = () => (filters.tags || []).length + (filters.excludeTags || []).length;

  const getSeasonBadge = () => (filters.season ? 1 : 0) + (filters.seasonYear ? 1 : 0);

  const getScoreBadge = () => {
    let count = 0;
    if (filters.averageScoreMin) count++;
    if (filters.averageScoreMax) count++;
    if (filters.popularityMin) count++;
    if (filters.episodesMin || filters.episodesMax) count++;
    if (filters.durationMin || filters.durationMax) count++;
    return count;
  };

  const getOriginBadge = () => {
    let count = 0;
    if (filters.countryOfOrigin) count++;
    if ((filters.sourceMaterial || []).length > 0) count++;
    if ((filters.studios || []).length > 0) count++;
    return count;
  };

  const getOptionsBadge = () => (filters.isAdult ? 1 : 0);

  return (
    <>
      <FilterSection
        id="sort"
        title="Tri et format"
        description="Ordre de tri, format et statut de diffusion"
        icon={Settings}
        isOpen={expandedSections?.sort}
        onToggle={onToggleSection}
        badgeCount={getSortBadge()}
      >
        <div className="filter-group">
          <LabelWithTooltip
            label="Trier par"
            tooltip="Définir l’ordre des résultats AniList. Tendances affiche les titres actuellement populaires."
          />
          <SearchableSelect
            options={anilistSortOptions}
            value={filters.sortBy || 'TRENDING_DESC'}
            onChange={(value) => onFiltersChange('sortBy', value)}
            placeholder="Tendances"
            searchPlaceholder="Rechercher..."
            labelKey="label"
            valueKey="value"
            allowClear={false}
          />
        </div>

        <div className="filter-group">
          <LabelWithTooltip
            label="Format"
            tooltip="Filtrer selon le format : TV, film, OVA, ONA, spécial, etc."
          />
          <AnimeFormatSelector
            selected={filters.format || []}
            options={availableFormatOptions}
            onChange={(formats) => onFiltersChange('format', formats)}
          />
        </div>

        <div className="filter-group">
          <LabelWithTooltip
            label="Statut"
            tooltip="Filtrer selon le statut : en diffusion, terminé, pas encore diffusé, etc."
          />
          <AnimeFormatSelector
            selected={filters.status || []}
            options={anilistStatusOptions}
            onChange={(statuses) => onFiltersChange('status', statuses)}
          />
        </div>
      </FilterSection>

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
          genres={anilistGenreObjects}
          selectedGenres={filters.genres || []}
          excludedGenres={filters.excludeGenres || []}
          genreMatchMode="any"
          onInclude={handleTriStateGenreClick}
          onExclude={handleTriStateGenreClick}
          onClear={handleTriStateGenreClick}
          onSetMatchMode={() => {}}
          showMatchMode={false}
          loading={false}
          onRefresh={() => {}}
        />
      </FilterSection>

      {anilistTagObjects.length > 0 && (
        <FilterSection
          id="tags"
          title="Tags"
          description="Filtrer selon les tags AniList"
          icon={Tag}
          isOpen={expandedSections?.tags}
          onToggle={onToggleSection}
          badgeCount={getTagBadge()}
        >
          <div className="filter-group">
            <LabelWithTooltip
              label="Tags à inclure"
              tooltip="Filtrer les anime contenant ces tags (ex. Isekai, Réincarnation, Gore)."
            />
            <MultiSelect
              options={anilistTagObjects}
              value={filters.tags || []}
              onChange={(tags) => onFiltersChange('tags', tags.length > 0 ? tags : undefined)}
              placeholder="Rechercher et sélectionner des tags..."
              searchPlaceholder="Saisissez pour rechercher des tags..."
              labelKey="label"
              valueKey="value"
              maxDisplay={5}
            />
          </div>
          <div className="filter-group">
            <LabelWithTooltip
              label="Tags à exclure"
              tooltip="Exclure les anime possédant ces tags."
            />
            <MultiSelect
              options={anilistTagObjects}
              value={filters.excludeTags || []}
              onChange={(tags) =>
                onFiltersChange('excludeTags', tags.length > 0 ? tags : undefined)
              }
              placeholder="Rechercher des tags à exclure..."
              searchPlaceholder="Saisissez pour rechercher des tags..."
              labelKey="label"
              valueKey="value"
              maxDisplay={5}
            />
          </div>
        </FilterSection>
      )}

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
          <div className="filter-group">
            <LabelWithTooltip
              label="Anime saisonnier"
              tooltip="Filtrer selon la saison (hiver, printemps, été, automne) et l’année."
            />
            <AnimeSeasonSelector
              season={filters.season}
              year={filters.seasonYear}
              onSeasonChange={(val) => onFiltersChange('season', val)}
              onYearChange={(val) => onFiltersChange('seasonYear', val)}
              seasonOptions={anilistSeasonOptions}
            />
          </div>
        </FilterSection>
      )}

      <FilterSection
        id="score"
        title="Score, Popularité & Durée"
        description="Filtrer selon la note, la popularité, les épisodes et la durée"
        icon={Star}
        isOpen={expandedSections?.score}
        onToggle={onToggleSection}
        badgeCount={getScoreBadge()}
      >
        <RangeSlider
          label="Score moyen"
          min={0}
          max={100}
          step={1}
          value={[filters.averageScoreMin || 0, filters.averageScoreMax || 100]}
          onChange={handleScoreChange}
        />

        <div className="filter-spacer" />

        <SingleSlider
          label="Popularité minimale"
          tooltip="Nombre minimum d’utilisateurs suivant ce titre sur AniList."
          min={0}
          max={100000}
          step={100}
          value={filters.popularityMin || 0}
          onChange={(v) => onFiltersChange('popularityMin', v || undefined)}
        />

        <div className="filter-spacer" />

        <RangeSlider
          label="Nombre d'épisodes"
          tooltip="Filtrer selon le nombre d’épisodes."
          min={0}
          max={150}
          step={1}
          value={[filters.episodesMin || 0, filters.episodesMax || 150]}
          onChange={handleEpisodeChange}
        />

        <div className="filter-spacer" />

        <RangeSlider
          label="Durée (minutes par épisode)"
          tooltip="Filtrer selon la durée des épisodes en minutes."
          min={0}
          max={180}
          step={1}
          value={[filters.durationMin || 0, filters.durationMax || 180]}
          onChange={handleDurationChange}
        />
      </FilterSection>

      <FilterSection
        id="origin"
        title="Origine, source et studios"
        description="Pays d’origine, œuvre source et studios d’animation"
        icon={Globe}
        isOpen={expandedSections?.origin}
        onToggle={onToggleSection}
        badgeCount={getOriginBadge()}
      >
        <div className="filter-group">
          <LabelWithTooltip
            label="Pays d’origine"
            tooltip="Filtrer les anime selon leur pays d’origine (Japon, Corée du Sud, Chine, etc.)."
          />
          <SearchableSelect
            options={countrySelectOptions}
            value={filters.countryOfOrigin || ''}
            onChange={(val) => onFiltersChange('countryOfOrigin', val || undefined)}
            placeholder="Tous les pays"
            searchPlaceholder="Rechercher des pays..."
            labelKey="label"
            valueKey="value"
          />
        </div>

        <div className="filter-group">
          <LabelWithTooltip
            label="Œuvre source"
            tooltip="Filtrer selon l’œuvre source : manga, light novel, visual novel, original, etc."
          />
          <AnimeFormatSelector
            selected={filters.sourceMaterial || []}
            options={anilistSourceOptions}
            onChange={(sources) => onFiltersChange('sourceMaterial', sources)}
          />
        </div>

        <div className="filter-group">
          <LabelWithTooltip
            label="Studios"
            tooltip="Filtrer selon le studio d’animation (ex. Studio Ghibli, MADHOUSE, MAPPA)."
          />
          <SearchInput
            type="company"
            placeholder="Rechercher des studios d’animation..."
            onSearch={searchAnilistStudios}
            selectedItems={selectedStudios}
            onSelect={handleStudiosChange}
            onRemove={handleStudiosChange}
          />
        </div>
      </FilterSection>

      <FilterSection
        id="options"
        title="Options"
        description="Paramètres de contenu adulte"
        icon={Eye}
        isOpen={expandedSections?.options}
        onToggle={onToggleSection}
        badgeCount={getOptionsBadge()}
      >
        <div className="checkbox-grid">
          <Checkbox
            checked={!!filters.isAdult}
            onChange={(checked) => onFiltersChange('isAdult', checked || undefined)}
            label="Inclure le contenu adulte"
            tooltip="Inclure les anime adultes/18+ dans les résultats."
          />
        </div>
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
