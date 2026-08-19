import { TMDB_SOURCE } from './tmdb.source';
import { ANILIST_SOURCE } from './anilist.source';
import { MAL_SOURCE } from './mal.source';
import { KITSU_SOURCE } from './kitsu.source';
import { SIMKL_SOURCE } from './simkl.source';
import { BINGEBASE_SOURCE } from './bingebase.source';

const SOURCE_REGISTRY = new Map([
  [TMDB_SOURCE.id, TMDB_SOURCE],
  [ANILIST_SOURCE.id, ANILIST_SOURCE],
  [MAL_SOURCE.id, MAL_SOURCE],
  [KITSU_SOURCE.id, KITSU_SOURCE],
  [SIMKL_SOURCE.id, SIMKL_SOURCE],
  [BINGEBASE_SOURCE.id, BINGEBASE_SOURCE],
]);

export function getSource(id) {
  return SOURCE_REGISTRY.get(id ?? 'tmdb') ?? SOURCE_REGISTRY.get('tmdb');
}

export function getAllSources() {
  return Array.from(SOURCE_REGISTRY.values());
}

export {
  TMDB_SOURCE,
  ANILIST_SOURCE,
  MAL_SOURCE,
  KITSU_SOURCE,
  SIMKL_SOURCE,
  BINGEBASE_SOURCE,
};
