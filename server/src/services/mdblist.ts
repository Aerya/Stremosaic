import * as tmdb from './tmdb/index.ts';
import type {
  ContentType,
  StremioMetaPreview,
  TmdbDetails,
  TmdbSearchResponse,
} from '../types/index.ts';

const MDBLIST_ORIGIN = 'https://mdblist.com';
const USER_AGENT = 'Stremosaic/2 (+https://github.com/Aerya/Stremosaic)';
const PUBLIC_LIST_PATH = /^\/lists\/(?:official\/(?:movies|shows)\/|[a-z0-9_-]+\/)[a-z0-9_-]+\/?$/i;

export function normalizePublicMdblistUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('URL de liste MDBList invalide');
  }
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'mdblist.com' ||
    !PUBLIC_LIST_PATH.test(url.pathname)
  ) {
    throw new Error('URL de liste MDBList invalide');
  }
  return `${MDBLIST_ORIGIN}${url.pathname.replace(/\/$/, '')}`;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchPublicMdblistMetas(
  apiKey: string,
  rawUrl: string,
  type: ContentType
): Promise<StremioMetaPreview[]> {
  const listUrl = normalizePublicMdblistUrl(rawUrl);
  const response = await fetch(listUrl, {
    headers: { accept: 'text/html', 'user-agent': USER_AGENT },
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`MDBList HTTP ${response.status}`);

  const html = await response.text();
  const items = extractPublicMdblistItems(html, type);

  const contentType = type === 'series' ? 'series' : 'movie';
  const metas: StremioMetaPreview[] = [];
  for (const item of items) {
    const data = (await tmdb.search(apiKey, item.title, contentType, 1)) as TmdbSearchResponse;
    const results = Array.isArray(data?.results) ? data.results : [];
    const hit =
      results.find((candidate) => {
        if (!item.year) return false;
        const date =
          'first_air_date' in candidate ? candidate.first_air_date : candidate.release_date;
        return String(date || '').startsWith(String(item.year));
      }) || results[0];
    if (!hit) continue;
    const details = (await tmdb.getDetails(apiKey, hit.id, contentType)) as TmdbDetails;
    const meta = await tmdb.toStremioMetaPreview(details, contentType, null, null, null);
    if (meta) metas.push(meta);
  }
  return metas;
}

export function extractPublicMdblistItems(
  html: string,
  type: ContentType
): Array<{ title: string; year?: number }> {
  const wantedPath = type === 'series' ? 'show' : 'movie';
  const officialItemPattern = new RegExp(
    `<a[^>]+class=["'][^"']*(?:jw-chart-card__title|item-title)[^"']*["'][^>]+href=["']\/${wantedPath}\/[^"']+["'][^>]*>([\\s\\S]*?)<\\/a>`,
    'gi'
  );
  const userListItemPattern = new RegExp(
    `<div[^>]+class=["'][^"']*header\\s+${wantedPath}-title[^"']*["'][^>]+title=["']([^"']+)["']`,
    'gi'
  );
  const items: Array<{ title: string; year?: number }> = [];
  const seen = new Set<string>();
  const addMatches = (pattern: RegExp): void => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null && items.length < 50) {
      const label = decodeHtml(match[1]);
      const yearMatch = label.match(/\((\d{4})\)\s*$/);
      const title = label.replace(/\s*\(\d{4}\)\s*$/, '').trim();
      if (!title || seen.has(label)) continue;
      seen.add(label);
      items.push({ title, year: yearMatch ? Number(yearMatch[1]) : undefined });
    }
  };
  addMatches(officialItemPattern);
  if (items.length === 0) addMatches(userListItemPattern);
  return items;
}
