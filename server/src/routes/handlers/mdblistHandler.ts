import type { Request, Response } from 'express';
import { buildCatalogId } from '../../constants.ts';
import { getApiKeyFromConfig, getUserConfig } from '../../services/configService.ts';
import { fetchPublicMdblistMetas } from '../../services/mdblist.ts';
import type { ContentType } from '../../types/index.ts';

export async function handleMdblistCatalogRequest(
  userId: string,
  type: ContentType,
  catalogId: string,
  _extra: Record<string, string>,
  res: Response,
  _req: Request
): Promise<void> {
  try {
    const config = await getUserConfig(userId);
    if (!config) {
      res.json({ metas: [] });
      return;
    }
    const catalog = config.catalogs.find(
      (candidate) =>
        candidate.source === 'mdblist' && buildCatalogId('mdblist', candidate) === catalogId
    );
    const url = catalog?.filters?.mdblistListUrl;
    const apiKey = getApiKeyFromConfig(config);
    if (!url || !apiKey) {
      res.json({ metas: [] });
      return;
    }
    res.json({ metas: await fetchPublicMdblistMetas(apiKey, url, type) });
  } catch {
    res.json({ metas: [] });
  }
}
