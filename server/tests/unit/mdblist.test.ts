import { describe, expect, it } from 'vitest';
import {
  extractPublicMdblistItems,
  normalizePublicMdblistUrl,
} from '../../src/services/mdblist.ts';

describe('normalizePublicMdblistUrl', () => {
  it('accepts public user and official list URLs', () => {
    expect(normalizePublicMdblistUrl('https://mdblist.com/lists/aerya/films/')).toBe(
      'https://mdblist.com/lists/aerya/films'
    );
    expect(
      normalizePublicMdblistUrl(
        'https://mdblist.com/lists/official/movies/justwatch-streaming-charts'
      )
    ).toContain('/lists/official/movies/justwatch-streaming-charts');
  });

  it.each([
    'http://mdblist.com/lists/aerya/films',
    'https://evil.example/lists/aerya/films',
    'https://mdblist.com.evil.example/lists/aerya/films',
    'https://mdblist.com@127.0.0.1/lists/aerya/films',
    'https://mdblist.com/api/private',
  ])('rejects unsafe or unsupported URLs: %s', (url) => {
    expect(() => normalizePublicMdblistUrl(url)).toThrow('URL de liste MDBList invalide');
  });
});

describe('extractPublicMdblistItems', () => {
  it('extracts official chart titles', () => {
    const html = `<a class="jw-chart-card__title" href="/movie/abc-film">Film &amp; Test (2026)</a>`;
    expect(extractPublicMdblistItems(html, 'movie')).toEqual([
      { title: 'Film & Test', year: 2026 },
    ]);
  });

  it('extracts regular public-list titles and keeps the requested media type', () => {
    const html = [
      '<div class="header movie-title" title="Un film (2024)">',
      '<div class="header show-title" title="Une série (2025)">',
    ].join('');
    expect(extractPublicMdblistItems(html, 'series')).toEqual([{ title: 'Une série', year: 2025 }]);
  });
});
