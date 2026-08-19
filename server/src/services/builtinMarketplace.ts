import crypto from 'crypto';
import { getStorage } from './storage/index.ts';
import type { MarketplaceEntry } from '../types/marketplace.ts';
import type { SourceType } from '../types/config.ts';
import type { ContentType } from '../types/common.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('builtinMarketplace');

const BUILTINS = [
  {"id": "3b4141ce-5ed6-8fe5-e696-91aea48e0260", "key": "tmdb-movie-trending_day", "name": "Tendances du jour — Films", "desc": "Catalogue TMDB prêt à l’emploi : tendances du jour.", "source": "tmdb", "type": "movie", "filters": {"listType": "trending_day"}, "tags": ["tmdb", "movie", "trending_day"]},
  {"id": "5d0758ee-20a4-1c11-f919-a8c45e53c50a", "key": "tmdb-movie-trending_week", "name": "Tendances de la semaine — Films", "desc": "Catalogue TMDB prêt à l’emploi : tendances de la semaine.", "source": "tmdb", "type": "movie", "filters": {"listType": "trending_week"}, "tags": ["tmdb", "movie", "trending_week"]},
  {"id": "0c97b98e-9c54-7de6-dfda-f74be59f4b67", "key": "tmdb-movie-popular", "name": "Populaires — Films", "desc": "Catalogue TMDB prêt à l’emploi : populaires.", "source": "tmdb", "type": "movie", "filters": {"listType": "popular"}, "tags": ["tmdb", "movie", "popular"]},
  {"id": "b4d257ce-3bbd-382c-da8a-408907f3d9a6", "key": "tmdb-movie-top_rated", "name": "Les mieux notés — Films", "desc": "Catalogue TMDB prêt à l’emploi : les mieux notés.", "source": "tmdb", "type": "movie", "filters": {"listType": "top_rated"}, "tags": ["tmdb", "movie", "top_rated"]},
  {"id": "867af8b7-25a6-c9e8-6005-2ff894ce954a", "key": "tmdb-movie-now_playing", "name": "Actuellement au cinéma — Films", "desc": "Catalogue TMDB prêt à l’emploi : actuellement au cinéma.", "source": "tmdb", "type": "movie", "filters": {"listType": "now_playing"}, "tags": ["tmdb", "movie", "now_playing"]},
  {"id": "bbf4ca15-f97c-4b9e-c50b-240dcbcccf3c", "key": "tmdb-movie-upcoming", "name": "Prochainement — Films", "desc": "Catalogue TMDB prêt à l’emploi : prochainement.", "source": "tmdb", "type": "movie", "filters": {"listType": "upcoming"}, "tags": ["tmdb", "movie", "upcoming"]},
  {"id": "2409409a-0227-b35f-e8ea-a2f4d62bb382", "key": "tmdb-series-trending_day", "name": "Tendances du jour — Séries", "desc": "Catalogue TMDB prêt à l’emploi : tendances du jour.", "source": "tmdb", "type": "series", "filters": {"listType": "trending_day"}, "tags": ["tmdb", "series", "trending_day"]},
  {"id": "35a67180-32db-8174-798a-dad9881d2a94", "key": "tmdb-series-trending_week", "name": "Tendances de la semaine — Séries", "desc": "Catalogue TMDB prêt à l’emploi : tendances de la semaine.", "source": "tmdb", "type": "series", "filters": {"listType": "trending_week"}, "tags": ["tmdb", "series", "trending_week"]},
  {"id": "ac7af394-b983-580a-075f-0a96be518d11", "key": "tmdb-series-popular", "name": "Populaires — Séries", "desc": "Catalogue TMDB prêt à l’emploi : populaires.", "source": "tmdb", "type": "series", "filters": {"listType": "popular"}, "tags": ["tmdb", "series", "popular"]},
  {"id": "145946a3-25a6-87b1-5a2d-af2575558756", "key": "tmdb-series-top_rated", "name": "Les mieux notés — Séries", "desc": "Catalogue TMDB prêt à l’emploi : les mieux notés.", "source": "tmdb", "type": "series", "filters": {"listType": "top_rated"}, "tags": ["tmdb", "series", "top_rated"]},
  {"id": "fc2d6460-2fb7-1394-34ff-4def2f7c86a3", "key": "tmdb-series-airing_today", "name": "Diffusées aujourd’hui — Séries", "desc": "Catalogue TMDB prêt à l’emploi : diffusées aujourd’hui.", "source": "tmdb", "type": "series", "filters": {"listType": "airing_today"}, "tags": ["tmdb", "series", "airing_today"]},
  {"id": "14124ce9-c9c4-d5da-2640-e3a788d5eea1", "key": "tmdb-series-on_the_air", "name": "En cours de diffusion — Séries", "desc": "Catalogue TMDB prêt à l’emploi : en cours de diffusion.", "source": "tmdb", "type": "series", "filters": {"listType": "on_the_air"}, "tags": ["tmdb", "series", "on_the_air"]},
  {"id": "8f88f20d-ac5e-57a3-566f-ed4b18b9185c", "key": "anilist-trending", "name": "Anime tendances — AniList", "desc": "Anime en tendance via AniList.", "source": "anilist", "type": "anime", "filters": {"sortBy": "TRENDING_DESC"}, "tags": ["anilist", "anime", "tendance"]},
  {"id": "7611d88c-a57f-28ad-67ba-c3ba8c23baeb", "key": "anilist-popular", "name": "Anime populaires — AniList", "desc": "Anime les plus populaires via AniList.", "source": "anilist", "type": "anime", "filters": {"sortBy": "POPULARITY_DESC"}, "tags": ["anilist", "anime", "populaire"]},
  {"id": "36ca8ac5-497e-41e8-cb52-388d4886a2ba", "key": "mal-top", "name": "Top Anime — MAL", "desc": "Classement anime MyAnimeList.", "source": "mal", "type": "anime", "filters": {"malRankingType": "all"}, "tags": ["mal", "anime", "classement"]},
  {"id": "e647aab7-04cf-b2ec-f6f0-ac9ba87635a6", "key": "kitsu-trending", "name": "Anime tendances — Kitsu", "desc": "Anime tendances via Kitsu.", "source": "kitsu", "type": "anime", "filters": {"kitsuListType": "trending", "kitsuSort": "-averageRating"}, "tags": ["kitsu", "anime", "tendance"]},
  {"id": "df20f6b6-dd31-f3bf-f5cc-aa8b823e14f1", "key": "simkl-series", "name": "Séries tendances — Simkl", "desc": "Séries tendances de la semaine via Simkl.", "source": "simkl", "type": "series", "filters": {"simklListType": "trending", "simklTrendingPeriod": "week"}, "tags": ["simkl", "series", "tendance"]},
  {"id": "4c65ba36-2ffc-5a59-cfb3-323a15413341", "key": "simkl-movies", "name": "Films tendances — Simkl", "desc": "Films tendances de la semaine via Simkl.", "source": "simkl", "type": "movie", "filters": {"simklListType": "trending", "simklTrendingPeriod": "week"}, "tags": ["simkl", "movie", "tendance"]}
] as const;

export async function seedBuiltinMarketplace(): Promise<void> {
  const storage = getStorage();
  let seeded = 0;
  for (const item of BUILTINS) {
    const now = new Date();
    const entry: MarketplaceEntry = {
      marketplaceId: item.id,
      provenance: { originUserId: 'stremosaic', originCatalogId: `builtin-${item.key}`, originConfigName: 'Stremosaic' },
      name: item.name,
      description: item.desc,
      tags: [...item.tags],
      type: item.type as ContentType,
      source: item.source as SourceType,
      genres: [],
      filterFacets: [],
      filters: { ...item.filters },
      visibility: 'public',
      moderation: 'active',
      engagement: { likes: 0, installs: 0, views: 0, trendingScore: 1 },
      contentHash: crypto.createHash('sha256').update(JSON.stringify([item.name,item.type,item.source,item.filters])).digest('hex'),
      publishedAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };
    await storage.upsertMarketplaceEntry(entry);
    seeded++;
  }
  log.info('Built-in marketplace ready', { seeded });
}
