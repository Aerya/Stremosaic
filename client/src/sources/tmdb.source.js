import { lazy } from 'react';
import { resolveOptionLabel, resolveSortLabel } from '../utils/filterLabels';

const IMDB_ONLY_KEYS = [
  'imdbListId',
  'imdbRatingMin',
  'imdbRatingMax',
  'totalVotesMin',
  'totalVotesMax',
  'releaseDateStart',
  'releaseDateEnd',
  'imdbCountries',
  'languages',
  'keywords',
  'awardsWon',
  'awardsNominated',
  'types',
  'sortOrder',
  'rankedList',
  'rankedLists',
  'excludeRankedLists',
  'rankedListMaxRank',
  'creditedNames',
  'companies',
  'certificateRating',
  'certificateCountry',
  'certificates',
  'explicitContent',
  'plot',
  'filmingLocations',
  'withData',
  'inTheatersLat',
  'inTheatersLong',
  'inTheatersRadius',
];

/** @implements {import('./types').SourceDescriptor} */
export const TMDB_SOURCE = {
  id: 'tmdb',
  label: 'TMDB',
  supportedTypes: ['movie', 'series'],
  defaultSortBy: 'popularity.desc',

  defaultFilters: {
    genres: [],
    excludeGenres: [],
    sortBy: 'popularity.desc',
    imdbOnly: false,
    voteCountMin: 0,
  },

  movieOnlyFilterKeys: [
    'includeVideo',
    'primaryReleaseYear',
    'releaseDateFrom',
    'releaseDateTo',
    'releaseTypes',
    'releaseType',
  ],

  seriesOnlyFilterKeys: [
    'airDateFrom',
    'airDateTo',
    'firstAirDateFrom',
    'firstAirDateTo',
    'firstAirDateYear',
    'includeNullFirstAirDates',
    'screenedTheatrically',
    'timezone',
    'withNetworks',
    'networks',
    'tvStatus',
    'tvType',
  ],

  cleanFiltersOnSwitch(currentFilters) {
    const result = { ...currentFilters };
    for (const key of IMDB_ONLY_KEYS) {
      delete result[key];
    }
    return result;
  },

  computeActiveChips(filters, refData) {
    const {
      genres = { movie: [], series: [] },
      sortOptions = { movie: [], series: [] },
      originalLanguages = [],
      countries = [],
      tvStatuses = [],
      tvTypes = [],
      watchRegions = [],
      monetizationTypes = [],
      selectedPeople = [],
      selectedCompanies = [],
      selectedKeywords = [],
      excludeKeywords = [],
      excludeCompanies = [],
      contentType = 'movie',
    } = refData;

    const active = [];
    const isMovieType = contentType === 'movie';

    if (filters.sortBy && filters.sortBy !== 'popularity.desc') {
      const sortOpts = sortOptions[contentType] || sortOptions.movie || [];
      const hasKnownSort = sortOpts.some((option) => option?.value === String(filters.sortBy));
      if (sortOpts.length === 0 || hasKnownSort) {
        active.push({
          key: 'sortBy',
          label: `Sort: ${resolveSortLabel(sortOpts, filters.sortBy)}`,
          section: 'filters',
        });
      }
    }

    if (filters.genres?.length > 0) {
      const names = filters.genres
        .map((id) => (genres[contentType] || []).find((g) => g.id === id)?.name || id)
        .slice(0, 2);
      const extra = filters.genres.length > 2 ? ` +${filters.genres.length - 2}` : '';
      active.push({
        key: 'genres',
        label: `Genres: ${names.join(', ')}${extra}`,
        section: 'genres',
      });
    }

    if (filters.excludeGenres?.length > 0) {
      const names = filters.excludeGenres
        .map((id) => (genres[contentType] || []).find((g) => g.id === id)?.name || id)
        .slice(0, 2);
      const extra = filters.excludeGenres.length > 2 ? ` +${filters.excludeGenres.length - 2}` : '';
      active.push({
        key: 'excludeGenres',
        label: `Exclude: ${names.join(', ')}${extra}`,
        section: 'genres',
      });
    }

    if (filters.language) {
      const lang = originalLanguages.find((l) => l.iso_639_1 === filters.language);
      active.push({
        key: 'language',
        label: `Language: ${lang?.english_name || filters.language}`,
        section: 'filters',
      });
    }

    if (filters.countries) {
      const countriesArr = Array.isArray(filters.countries)
        ? filters.countries
        : String(filters.countries).split(',').filter(Boolean);
      if (countriesArr.length > 0) {
        const countryNames = countriesArr
          .map((code) => countries.find((c) => c.iso_3166_1 === code)?.english_name || code)
          .slice(0, 2);
        const extra = countriesArr.length > 2 ? ` +${countriesArr.length - 2}` : '';
        active.push({
          key: 'countries',
          label: `Pays : ${countryNames.join(', ')}${extra}`,
          section: 'filters',
        });
      }
    }

    if (filters.yearFrom || filters.yearTo) {
      active.push({
        key: 'year',
        label: `Année : ${filters.yearFrom || 'Toutes'}–${filters.yearTo || 'Présent'}`,
        section: 'filters',
      });
    }

    if (filters.ratingMin > 0 || (filters.ratingMax != null && filters.ratingMax < 10)) {
      active.push({
        key: 'rating',
        label: `Note : ${filters.ratingMin || 0}–${filters.ratingMax ?? 10}`,
        section: 'filters',
      });
    }

    if (filters.runtimeMin || filters.runtimeMax) {
      active.push({
        key: 'runtime',
        label: `Durée : ${filters.runtimeMin || 0}–${filters.runtimeMax || '∞'}min`,
        section: 'filters',
      });
    }

    if (filters.voteCountMin > 0) {
      active.push({
        key: 'voteCountMin',
        label: `Votes min : ${filters.voteCountMin.toLocaleString()}`,
        section: 'filters',
      });
    }

    if (filters.datePreset) {
      active.push({ key: 'datePreset', label: `Date : ${filters.datePreset}`, section: 'release' });
    } else if (
      !filters.lastXYears &&
      (filters.releaseDateFrom || filters.releaseDateTo || filters.airDateFrom || filters.airDateTo)
    ) {
      const rawFrom = filters.releaseDateFrom || filters.airDateFrom || '…';
      const rawTo = filters.releaseDateTo || filters.airDateTo || '…';
      active.push({
        key: 'releaseDate',
        label: `${isMovieType ? 'Sortie' : 'Diffusion'} : ${rawFrom} – ${rawTo}`,
        section: 'release',
      });
    }

    if (!isMovieType && (filters.firstAirDateFrom || filters.firstAirDateTo)) {
      active.push({
        key: 'firstAirDate',
        label: `Première : ${filters.firstAirDateFrom || '…'} – ${filters.firstAirDateTo || '…'}`,
        section: 'release',
      });
    }

    if (filters.firstAirDateYear) {
      active.push({
        key: 'firstAirDateYear',
        label: `Première année de diffusion : ${filters.firstAirDateYear}`,
        section: 'release',
      });
    }

    if (filters.primaryReleaseYear) {
      active.push({
        key: 'primaryReleaseYear',
        label: `Année de sortie : ${filters.primaryReleaseYear}`,
        section: 'release',
      });
    }

    if (isMovieType && filters.region) {
      const label =
        countries.find((c) => c.iso_3166_1 === filters.region)?.english_name || filters.region;
      active.push({ key: 'region', label: `Région de sortie : ${label}`, section: 'release' });
    }

    if (isMovieType && filters.releaseTypes?.length > 0) {
      active.push({
        key: 'releaseTypes',
        label: `${filters.releaseTypes.length} type(s) de sortie`,
        section: 'release',
      });
    }

    if (filters.certifications?.length > 0) {
      active.push({
        key: 'certifications',
        label: `Classification : ${filters.certifications.join(', ')}`,
        section: 'release',
      });
    }

    if (filters.certificationMin || filters.certificationMax) {
      active.push({
        key: 'certificationRange',
        label: `Tranche d’âge : ${filters.certificationMin || 'Toutes'}–${filters.certificationMax || 'Toutes'}`,
        section: 'release',
      });
    }

    if (filters.certificationCountry && filters.certificationCountry !== 'US') {
      const label =
        countries.find((c) => c.iso_3166_1 === filters.certificationCountry)?.english_name ||
        filters.certificationCountry;
      active.push({
        key: 'certificationCountry',
        label: `Pays de classification : ${label}`,
        section: 'release',
      });
    }

    if (filters.timezone) {
      active.push({ key: 'timezone', label: `Fuseau horaire : ${filters.timezone}`, section: 'release' });
    }

    if (!isMovieType && filters.tvStatus) {
      active.push({
        key: 'tvStatus',
        label: `Statut : ${resolveOptionLabel(tvStatuses, filters.tvStatus)}`,
        section: 'release',
      });
    }

    if (!isMovieType && filters.tvType) {
      active.push({
        key: 'tvType',
        label: `Type : ${resolveOptionLabel(tvTypes, filters.tvType)}`,
        section: 'release',
      });
    }

    if (filters.watchRegion) {
      const label =
        watchRegions.find((r) => r.iso_3166_1 === filters.watchRegion)?.english_name ||
        filters.watchRegion;
      active.push({ key: 'watchRegion', label: `Région de streaming : ${label}`, section: 'streaming' });
    }

    if (filters.watchProviders?.length > 0) {
      active.push({
        key: 'watchProviders',
        label: `${filters.watchProviders.length} service(s) de streaming`,
        section: 'streaming',
      });
    }

    if (filters.watchMonetizationTypes?.length > 0) {
      const labels = filters.watchMonetizationTypes
        .map((v) => monetizationTypes.find((m) => m.value === v)?.label || v)
        .join(', ');
      active.push({
        key: 'watchMonetizationTypes',
        label: `Monétisation : ${labels}`,
        section: 'streaming',
      });
    }

    if (filters.withNetworks) {
      const count = filters.withNetworks.split('|').filter(Boolean).length;
      active.push({ key: 'withNetworks', label: `${count} chaîne(s)`, section: 'streaming' });
    }

    if (selectedPeople.length > 0) {
      const names = selectedPeople.slice(0, 2).map((p) => p.name);
      const extra = selectedPeople.length > 2 ? ` +${selectedPeople.length - 2}` : '';
      active.push({
        key: 'people',
        label: `Casting/Équipe : ${names.join(', ')}${extra}`,
        section: 'people',
      });
    }

    if (selectedCompanies.length > 0) {
      const names = selectedCompanies.slice(0, 2).map((c) => c.name);
      const extra = selectedCompanies.length > 2 ? ` +${selectedCompanies.length - 2}` : '';
      active.push({
        key: 'companies',
        label: `Studio : ${names.join(', ')}${extra}`,
        section: 'people',
      });
    }

    if (excludeCompanies.length > 0) {
      active.push({
        key: 'excludeCompanies',
        label: `Exclure ${excludeCompanies.length} studio(s)`,
        section: 'people',
      });
    }

    if (selectedKeywords.length > 0) {
      const names = selectedKeywords.slice(0, 2).map((k) => k.name);
      const extra = selectedKeywords.length > 2 ? ` +${selectedKeywords.length - 2}` : '';
      active.push({
        key: 'keywords',
        label: `Mots-clés : ${names.join(', ')}${extra}`,
        section: 'people',
      });
    }

    if (excludeKeywords.length > 0) {
      active.push({
        key: 'excludeKeywords',
        label: `Exclure ${excludeKeywords.length} mot(s)-clé(s)`,
        section: 'people',
      });
    }

    if (filters.includeAdult) {
      active.push({ key: 'includeAdult', label: 'Contenu adulte', section: 'options' });
    }

    if (filters.includeVideo) {
      active.push({ key: 'includeVideo', label: 'Inclure les vidéos', section: 'options' });
    }

    if (filters.randomize) {
      active.push({ key: 'randomize', label: 'Aléatoire', section: 'options' });
    }

    if (filters.discoverOnly) {
      active.push({ key: 'discoverOnly', label: 'Découverte uniquement', section: 'options' });
    }

    if (filters.includeNullFirstAirDates) {
      active.push({
        key: 'includeNullFirstAirDates',
        label: 'Dates de diffusion inconnues',
        section: 'options',
      });
    }

    if (filters.screenedTheatrically) {
      active.push({
        key: 'screenedTheatrically',
        label: 'Projeté au cinéma',
        section: 'options',
      });
    }

    if (filters.releasedOnly) {
      active.push({ key: 'releasedOnly', label: 'Sortis uniquement', section: 'release' });
    }

    if (filters.lastXYears) {
      active.push({
        key: 'lastXYears',
        label: `Les ${filters.lastXYears} dernières années`,
        section: 'release',
      });
    }

    return active;
  },

  FilterPanelComponent: lazy(() =>
    import('../components/config/catalog/sources/tmdb/TmdbFilterPanel').then((m) => ({
      default: m.TmdbFilterPanel,
    }))
  ),
};
