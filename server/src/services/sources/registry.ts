import { TmdbSource } from './TmdbSource.ts';
import { AnilistSource } from './AnilistSource.ts';
import { MalSource } from './MalSource.ts';
import { SimklSource } from './SimklSource.ts';
import { KitsuSource } from './KitsuSource.ts';
import { BingebaseSource } from './BingebaseSource.ts';
import type { IDiscoverSource } from './types.ts';

const SOURCE_REGISTRY = new Map<string, IDiscoverSource>([
  ['tmdb', TmdbSource],
  ['anilist', AnilistSource],
  ['mal', MalSource],
  ['simkl', SimklSource],
  ['kitsu', KitsuSource],
  ['bingebase', BingebaseSource],
]);

export function getSource(id: string | undefined): IDiscoverSource {
  return SOURCE_REGISTRY.get(id ?? 'tmdb') ?? TmdbSource;
}

export function getAllSources(): IDiscoverSource[] {
  return Array.from(SOURCE_REGISTRY.values());
}
