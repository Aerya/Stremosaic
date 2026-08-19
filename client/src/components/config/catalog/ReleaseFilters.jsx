import { useCallback, useMemo, useEffect, memo } from 'react';
import { Check } from 'lucide-react';
import { getTimeZones } from '@vvo/tzdb';
import { CertificationCountryFilter } from '../../forms/CertificationCountryFilter';
import { MultiSelect } from '../../forms/MultiSelect';
import { SearchableSelect } from '../../forms/SearchableSelect';
import { LabelWithTooltip } from '../../forms/Tooltip';
import { DATE_PRESETS, PRESET_DATE_MAP } from '../../../constants/datePresets';

const TZDB_TIMEZONES = getTimeZones();
const TZDB_BY_NAME = new Map(TZDB_TIMEZONES.map((tz) => [tz.name, tz]));

export const ReleaseFilters = memo(function ReleaseFilters({
  localCatalog,
  onFiltersChange,
  isMovie,
  countries,
  releaseTypes,
  tvStatuses,
  tvTypes,
  certOptions,
  certCountries,
}) {
  const TV_RELEASE_TYPE_VALUES = useMemo(() => new Set([1, 4, 6]), []);

  const safeCountries = Array.isArray(countries) ? countries : [];
  const safeReleaseTypes = useMemo(() => {
    const list = Array.isArray(releaseTypes) ? releaseTypes : [];
    if (isMovie) return list;
    return list.filter((item) => TV_RELEASE_TYPE_VALUES.has(Number(item?.value)));
  }, [releaseTypes, isMovie, TV_RELEASE_TYPE_VALUES]);
  const safeTvStatuses = Array.isArray(tvStatuses) ? tvStatuses : [];
  const safeTvTypes = Array.isArray(tvTypes) ? tvTypes : [];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (isMovie) return;
    const selected = Array.isArray(localCatalog?.filters?.releaseTypes)
      ? localCatalog.filters.releaseTypes
      : [];
    const cleaned = selected.filter((value) => TV_RELEASE_TYPE_VALUES.has(Number(value)));
    if (cleaned.length !== selected.length) {
      onFiltersChange('releaseTypes', cleaned);
    }
  }, [isMovie, localCatalog?.filters?.releaseTypes, onFiltersChange, TV_RELEASE_TYPE_VALUES]);

  const certificationCountryOptions = useMemo(
    () =>
      (Array.isArray(certCountries) ? certCountries : []).map((c) => ({
        value: c.iso_3166_1,
        label: c.english_name || c.iso_3166_1,
      })),
    [certCountries]
  );

  const certificationRatingOptions = useMemo(
    () =>
      (Array.isArray(certOptions) ? certOptions : []).map((c) => ({
        value: c.certification,
        label: c.certification,
      })),
    [certOptions]
  );

  const yearOptions = useMemo(() => {
    const years = [];
    for (let year = currentYear + 5; year >= 1900; year--) {
      years.push({ value: year, label: String(year) });
    }
    return years;
  }, [currentYear]);

  const timezoneOptions = useMemo(() => {
    const hasSupportedValuesOf =
      typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function';
    const supported = hasSupportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];
    const current =
      typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined;
    const selected = localCatalog?.filters?.timezone;

    const merged = Array.from(
      new Set([
        ...TZDB_TIMEZONES.map((tz) => tz.name),
        ...(Array.isArray(supported) ? supported : []),
        'UTC',
        current,
        selected,
      ])
    )
      .filter((tz) => typeof tz === 'string' && tz.trim().length > 0)
      .sort((a, b) => String(a).localeCompare(String(b)));

    const locale =
      typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    const searchableAreaPrefixes = new Set([
      'Africa',
      'America',
      'Antarctica',
      'Arctic',
      'Asia',
      'Atlantic',
      'Australia',
      'Europe',
      'Pacific',
      'UTC',
    ]);

    const getTimeZoneNames = (tz) => {
      const variants = ['long', 'short', 'longGeneric', 'shortGeneric'];
      const names = [];
      for (const variant of variants) {
        try {
          const parts = new Intl.DateTimeFormat(locale, {
            timeZone: tz,
            timeZoneName: variant,
          }).formatToParts(new Date());
          const name = parts.find((p) => p.type === 'timeZoneName')?.value;
          if (name) names.push(name);
        } catch {
          // Ignore unsupported variants/locales.
        }
      }
      return Array.from(new Set(names));
    };

    return merged.map((tz) => {
      const tzdbMeta = TZDB_BY_NAME.get(String(tz));
      const parts = String(tz).split('/').filter(Boolean);
      const area = parts[0] || '';
      const pathTerms = parts
        .slice(1)
        .map((p) => p.replace(/_/g, ' '))
        .filter(Boolean);
      const friendlyName = getTimeZoneNames(tz);
      const areaTerm = searchableAreaPrefixes.has(area) ? area : '';
      const searchText = [
        areaTerm,
        ...pathTerms,
        ...(Array.isArray(tzdbMeta?.mainCities) ? tzdbMeta.mainCities : []),
        tzdbMeta?.countryName,
        tzdbMeta?.countryCode,
        tzdbMeta?.alternativeName,
        ...(Array.isArray(tzdbMeta?.group) ? tzdbMeta.group : []),
        ...friendlyName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return {
        value: tz,
        label: tz,
        searchText,
      };
    });
  }, [localCatalog?.filters?.timezone]);

  const dateRangeError = useMemo(() => {
    const fromKey = isMovie ? 'releaseDateFrom' : 'airDateFrom';
    const toKey = isMovie ? 'releaseDateTo' : 'airDateTo';
    const from = localCatalog?.filters?.[fromKey];
    const to = localCatalog?.filters?.[toKey];
    const years = localCatalog?.filters?.lastXYears;
    if (years) return null;
    if (from && to && !from.startsWith('today') && !to.startsWith('today') && from > to)
      return '"From" date must be before "To" date';
    return null;
  }, [localCatalog?.filters, isMovie]);

  const premiereRangeError = useMemo(() => {
    const from = localCatalog?.filters?.firstAirDateFrom;
    const to = localCatalog?.filters?.firstAirDateTo;
    if (from && to && from > to) return 'La date de début doit être antérieure à la date de fin';
    return null;
  }, [localCatalog?.filters?.firstAirDateFrom, localCatalog?.filters?.firstAirDateTo]);

  const DATE_TAG_LABELS = {
    today: 'Aujourd’hui',
    'today-30d': 'Aujourd’hui − 30 jours',
    'today-90d': 'Aujourd’hui − 90 jours',
    'today-6mo': 'Aujourd’hui − 6 mois',
    'today-12mo': 'Aujourd’hui − 12 mois',
    'today+30d': 'Aujourd’hui + 30 jours',
    'today+3mo': 'Aujourd’hui + 3 mois',
  };

  const getDateTagLabel = (value) => DATE_TAG_LABELS[value] || null;

  const handleDatePreset = useCallback(
    (preset) => {
      const dates = PRESET_DATE_MAP[preset.value] || null;
      const fromKey = isMovie ? 'releaseDateFrom' : 'airDateFrom';
      const toKey = isMovie ? 'releaseDateTo' : 'airDateTo';
      onFiltersChange('datePreset', preset.value);
      onFiltersChange('lastXYears', undefined);
      onFiltersChange(fromKey, dates?.from);
      onFiltersChange(toKey, dates?.to);
    },
    [isMovie, onFiltersChange]
  );

  const handleLastXYears = useCallback(
    (value) => {
      const fromKey = isMovie ? 'releaseDateFrom' : 'airDateFrom';
      const toKey = isMovie ? 'releaseDateTo' : 'airDateTo';
      onFiltersChange('lastXYears', value);
      onFiltersChange('datePreset', undefined);
      onFiltersChange(fromKey, undefined);
      onFiltersChange(toKey, undefined);
    },
    [isMovie, onFiltersChange]
  );

  return (
    <>
      <div className="filter-group" style={{ marginTop: '12px' }}>
        <div className="date-quick-presets">
          {[
            { l: '30d', v: 'last_30_days' },
            { l: '90d', v: 'last_90_days' },
            { l: '6mo', v: 'last_180_days' },
            { l: '1y', v: 'last_365_days' },
            { l: 'Prochainement', v: 'next_30_days' },
          ].map((p) => (
            <button
              key={p.v}
              className={`date-preset ${localCatalog?.filters?.datePreset === p.v ? 'active' : ''}`}
              onClick={() => handleDatePreset({ label: p.l, value: p.v })}
            >
              {p.l}
            </button>
          ))}
          <div className="date-quick-presets-divider" />
          {[5, 10].map((n) => (
            <button
              key={n}
              className={`date-preset ${localCatalog?.filters?.lastXYears === n ? 'active' : ''}`}
              onClick={() =>
                handleLastXYears(localCatalog?.filters?.lastXYears === n ? undefined : n)
              }
            >
              {n}y
            </button>
          ))}
          <div className="last-x-years-input-group">
            <input
              type="number"
              className="input last-x-years-input"
              min="1"
              max="100"
              placeholder="#"
              value={localCatalog?.filters?.lastXYears ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                handleLastXYears(v ? Math.max(1, Math.min(100, Number(v))) : undefined);
              }}
            />
            <span className="last-x-years-label">yr</span>
          </div>
        </div>
      </div>

      <div className="filter-two-col">
        <div className="filter-group">
          <LabelWithTooltip
            label={isMovie ? 'Sortie à partir du' : 'Épisodes diffusés à partir du'}
            tooltip={
              isMovie
                ? 'Filtrer les films sortis à cette date ou après'
                : 'Filtrer les séries ayant des épisodes diffusés à cette date ou après'
            }
          />
          {(() => {
            const val = localCatalog?.filters?.[isMovie ? 'releaseDateFrom' : 'airDateFrom'] || '';
            const years = localCatalog?.filters?.lastXYears;
            const tag = getDateTagLabel(val);

            if (years) {
              return (
                <div className="date-today-badge">
                  <span>Cette année − {years} ans</span>
                  <span className="date-today-hint">Recalculé chaque année</span>
                </div>
              );
            }

            return tag ? (
              <div className="date-today-badge">
                <span>{tag}</span>
                <span className="date-today-hint">Recalculé chaque jour</span>
              </div>
            ) : (
              <input
                type="date"
                className="input"
                value={val}
                onChange={(e) => {
                  onFiltersChange('datePreset', undefined);
                  onFiltersChange(isMovie ? 'releaseDateFrom' : 'airDateFrom', e.target.value);
                }}
              />
            );
          })()}
        </div>
        <div className="filter-group">
          <LabelWithTooltip
            label={isMovie ? 'Sortie jusqu’au' : 'Épisodes diffusés jusqu’au'}
            tooltip={
              isMovie
                ? 'Filtrer les films sortis à cette date ou avant'
                : 'Filtrer les séries ayant des épisodes diffusés à cette date ou avant'
            }
          />
          {(() => {
            const val = localCatalog?.filters?.[isMovie ? 'releaseDateTo' : 'airDateTo'] || '';
            const years = localCatalog?.filters?.lastXYears;
            const tag = getDateTagLabel(val);

            if (years) {
              return (
                <div className="date-today-badge">
                  <span>Aujourd’hui</span>
                  <span className="date-today-hint">Recalculé chaque jour</span>
                </div>
              );
            }

            return tag ? (
              <div className="date-today-badge">
                <span>{tag}</span>
                <span className="date-today-hint">Recalculé chaque jour</span>
              </div>
            ) : (
              <input
                type="date"
                className={`input${dateRangeError ? ' field-invalid' : ''}`}
                value={val}
                onChange={(e) => {
                  onFiltersChange('datePreset', undefined);
                  onFiltersChange(isMovie ? 'releaseDateTo' : 'airDateTo', e.target.value);
                }}
              />
            );
          })()}
        </div>
      </div>
      {dateRangeError && <span className="field-error">{dateRangeError}</span>}

      <div
        className={`released-only-card ${localCatalog?.filters?.releasedOnly ? 'active' : ''}`}
        role="switch"
        aria-checked={!!localCatalog?.filters?.releasedOnly}
        tabIndex={0}
        onClick={() => onFiltersChange('releasedOnly', !localCatalog?.filters?.releasedOnly)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onFiltersChange('releasedOnly', !localCatalog?.filters?.releasedOnly);
          }
        }}
      >
        <div className="released-only-content">
          <span className="released-only-title">Déjà sortis uniquement</span>
          <span className="released-only-desc">
            {isMovie
              ? 'Afficher uniquement les films avec une sortie numérique'
              : 'Afficher uniquement les séries dont la diffusion a déjà commencé'}
          </span>
        </div>
        <div className="released-only-toggle">
          <div className="released-only-thumb" />
        </div>
      </div>

      {!isMovie && (
        <div className="filter-two-col" style={{ marginTop: '16px' }}>
          <div className="filter-group">
            <LabelWithTooltip
              label="Première diffusion à partir du"
              tooltip="Filtrer selon la date de première diffusion de la série. Il s’agit de la date du tout premier épisode, et non des dates de diffusion de chaque épisode."
            />
            <span className="filter-label-hint">Date de première diffusion de la série</span>
            <input
              type="date"
              className="input"
              value={localCatalog?.filters?.firstAirDateFrom || ''}
              onChange={(e) => onFiltersChange('firstAirDateFrom', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <LabelWithTooltip
              label="Première diffusion jusqu’au"
              tooltip="Date de première diffusion maximale à inclure. Les séries ayant commencé avant ou à cette date seront incluses."
            />
            <span className="filter-label-hint">Date maximale de première diffusion à inclure</span>
            <input
              type="date"
              className={`input${premiereRangeError ? ' field-invalid' : ''}`}
              value={localCatalog?.filters?.firstAirDateTo || ''}
              onChange={(e) => onFiltersChange('firstAirDateTo', e.target.value)}
            />
          </div>
        </div>
      )}
      {!isMovie && premiereRangeError && <span className="field-error">{premiereRangeError}</span>}

      {!isMovie && (
        <div className="filter-two-col" style={{ marginTop: '16px' }}>
          <div className="filter-group">
            <LabelWithTooltip
              label="Année de première diffusion"
              tooltip="Filtrer selon l’année de première diffusion de la série (TMDB first_air_date_year)."
            />
            <span className="filter-label-hint">Année de première diffusion de la série</span>
            <input
              type="number"
              className="input"
              min="1900"
              max={currentYear + 1}
              placeholder="e.g. 2019"
              value={localCatalog?.filters?.firstAirDateYear || ''}
              onChange={(e) => {
                const value = e.target.value;
                onFiltersChange('firstAirDateYear', value ? Number(value) : undefined);
              }}
            />
          </div>
          <div className="filter-group">
            <LabelWithTooltip
              label="Fuseau horaire"
              tooltip="Fuseau horaire IANA utilisé pour les calculs de dates (ex. Europe/Paris). Il influence les périodes relatives comme Aujourd’hui, les X dernières années et Déjà sortis uniquement."
            />
            <span className="filter-label-hint">
              Format IANA : Région/Ville (exemple : Europe/Paris)
            </span>
            <SearchableSelect
              options={timezoneOptions}
              value={localCatalog?.filters?.timezone || ''}
              onChange={(value) => onFiltersChange('timezone', value || undefined)}
              placeholder="Tous fuseaux (UTC par défaut)"
              searchPlaceholder="Rechercher un fuseau horaire..."
              labelKey="label"
              valueKey="value"
              searchLabel={false}
              searchKeys={['searchText']}
              aria-label="Fuseau horaire"
            />
          </div>
        </div>
      )}

      <div className="filter-group" style={{ marginTop: '16px' }}>
        <LabelWithTooltip
          label={isMovie ? 'Région de sortie' : 'Apparence régionale'}
          tooltip={
            isMovie
              ? 'Filtrer selon la date de sortie dans un pays spécifique. Utile car les films sortent souvent à des dates différentes selon les pays.'
              : 'Filtrer les séries TV selon les règles d’apparence régionale pour cibler un marché spécifique.'
          }
        />
        <span className="filter-label-hint">
          {isMovie
            ? 'Utiliser les dates de sortie régionales plutôt que la première mondiale'
            : 'Utiliser les règles de disponibilité régionales plutôt que par défaut'}
        </span>
        <SearchableSelect
          options={safeCountries}
          value={localCatalog?.filters?.region || ''}
          onChange={(value) => {
            onFiltersChange('region', value);
            if (isMovie && value) onFiltersChange('certificationCountry', value);
            if (!value) {
              onFiltersChange('releaseTypes', []);
              if (isMovie) onFiltersChange('certificationCountry', undefined);
            }
          }}
          placeholder="Monde entier"
          searchPlaceholder="Rechercher des pays..."
          labelKey="english_name"
          valueKey="iso_3166_1"
        />
      </div>

      {isMovie && (
        <div className="filter-group" style={{ marginTop: '16px' }}>
          <LabelWithTooltip
            label="Année de sortie principale"
            tooltip="Filtrer selon l’année de sortie principale du film (monde)."
          />
          <SearchableSelect
            options={yearOptions}
            value={localCatalog?.filters?.primaryReleaseYear || ''}
            onChange={(value) => {
              onFiltersChange('primaryReleaseYear', value ? Number(value) : undefined);
            }}
            placeholder="Toutes les années"
            searchPlaceholder="Rechercher une année..."
            labelKey="label"
            valueKey="value"
          />
        </div>
      )}

      <div className="filter-group" style={{ marginTop: '16px' }}>
        <LabelWithTooltip
          label={isMovie ? 'Type de sortie' : 'Type d’apparence régionale'}
          tooltip={
            isMovie
              ? 'Mode de sortie du film : Au cinéma, Numérique (streaming/téléchargement), Physique (DVD/Blu-ray), Diffusion TV, etc. Nécessite la sélection d’une région.'
              : 'Apparence de la série selon la région (ex. par canal ou type de sortie). Nécessite la sélection d’une région.'
          }
        />
        <MultiSelect
          options={safeReleaseTypes}
          value={localCatalog?.filters?.releaseTypes || []}
          onChange={(value) => onFiltersChange('releaseTypes', value)}
          placeholder={!localCatalog?.filters?.region ? 'Sélectionnez d’abord une région' : 'Tous types'}
          labelKey="label"
          valueKey="value"
          disabled={!localCatalog?.filters?.region}
        />
        {!localCatalog?.filters?.region && (
          <span className="filter-label-hint warning">
            Sélectionnez d’abord une région ci-dessus pour filtrer par type de sortie
          </span>
        )}
      </div>

      {!isMovie && (
        <div className="filter-two-col" style={{ marginTop: '16px' }}>
          <div className="filter-group">
            <LabelWithTooltip
              label="Statut de la série"
              tooltip="Statut actuel de la série : en cours, terminée, annulée, en production ou pilote."
            />
            <SearchableSelect
              options={safeTvStatuses}
              value={localCatalog?.filters?.tvStatus || ''}
              onChange={(value) => onFiltersChange('tvStatus', value)}
              placeholder="Tous"
              searchPlaceholder="Rechercher..."
              labelKey="label"
              valueKey="value"
              aria-label="Statut de la série"
            />
          </div>
          <div className="filter-group">
            <LabelWithTooltip
              label="Type de série"
              tooltip="Format de la série : fiction, téléréalité, documentaire, talk-show, actualités, mini-série, etc."
            />
            <SearchableSelect
              options={safeTvTypes}
              value={localCatalog?.filters?.tvType || ''}
              onChange={(value) => onFiltersChange('tvType', value)}
              placeholder="Tous"
              searchPlaceholder="Rechercher..."
              labelKey="label"
              valueKey="value"
              aria-label="Type de série"
            />
          </div>
        </div>
      )}

      <CertificationCountryFilter
        countryOptions={certificationCountryOptions}
        countryValue={localCatalog?.filters?.certificationCountry || ''}
        onCountryChange={(value) => onFiltersChange('certificationCountry', value || undefined)}
        ratingOptions={certificationRatingOptions}
        ratingsValue={localCatalog?.filters?.certifications || []}
        onRatingsChange={(value) => onFiltersChange('certifications', value)}
        countryLabel="Pays de classification par âge"
        countryTooltip="Sélectionnez le système de classification par âge d’un pays. Modifier ceci met à jour les options dans le filtre de classification par âge."
        ratingsLabel="Classification par âge"
        ratingsTooltip="Certification / classification par âge du contenu (ex. PG-13, R, TV-MA)."
        countryPlaceholder="US (par défaut)"
        ratingsPlaceholder="Tous"
        hint="Utilisez ceci pour des classifications exactes."
      />
    </>
  );
});
