import { lazy } from 'react';

export const MDBLIST_SOURCE = {
  id: 'mdblist',
  label: 'MDBList',
  supportedTypes: ['movie', 'series'],
  defaultSortBy: '',
  defaultFilters: { mdblistListUrl: '' },
  movieOnlyFilterKeys: [],
  seriesOnlyFilterKeys: [],
  cleanFiltersOnSwitch(filters) {
    return { mdblistListUrl: filters.mdblistListUrl || '' };
  },
  computeActiveChips(filters) {
    return filters.mdblistListUrl
      ? [{ key: 'mdblistListUrl', label: 'Liste MDBList', section: 'source' }]
      : [];
  },
  FilterPanelComponent: lazy(() =>
    import('../components/config/catalog/sources/mdblist/MdblistFilterPanel').then((module) => ({
      default: module.MdblistFilterPanel,
    }))
  ),
};
