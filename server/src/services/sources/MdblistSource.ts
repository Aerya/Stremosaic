import { handleMdblistCatalogRequest } from '../../routes/handlers/mdblistHandler.ts';
import type { CatalogFilters } from '../../types/config.ts';
import type { CatalogRequestContext, IDiscoverSource, ManifestSearchCatalog } from './types.ts';

export const MdblistSource: IDiscoverSource = {
  sourceId: 'mdblist',
  catalogIdPrefix: 'mdblist',
  defaultPageSize: 50,
  isEnabled: () => true,
  sanitizeFilters: (filters: CatalogFilters) => ({ mdblistListUrl: filters.mdblistListUrl }),
  getSearchCatalogs: (): ManifestSearchCatalog[] => [],
  async handleCatalogRequest(ctx: CatalogRequestContext): Promise<void> {
    await handleMdblistCatalogRequest(
      ctx.userId,
      ctx.type,
      ctx.catalogId,
      ctx.extra,
      ctx.res,
      ctx.req
    );
  },
};
