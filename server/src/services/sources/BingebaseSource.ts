import type { CatalogFilters } from '../../types/config.ts';
import type { IDiscoverSource, ManifestSearchCatalog, CatalogRequestContext } from './types.ts';
import { handleBingebaseCatalogRequest } from '../../routes/handlers/bingebaseHandler.ts';
export const BingebaseSource: IDiscoverSource = {
  sourceId: 'bingebase',
  catalogIdPrefix: 'bingebase',
  defaultPageSize: 50,
  isEnabled() {
    return true;
  },
  sanitizeFilters(filters: CatalogFilters) {
    return filters;
  },
  getSearchCatalogs(): ManifestSearchCatalog[] {
    return [];
  },
  async handleCatalogRequest(ctx: CatalogRequestContext) {
    await handleBingebaseCatalogRequest(
      ctx.userId,
      ctx.type,
      ctx.catalogId,
      ctx.extra,
      ctx.res,
      ctx.req
    );
  },
};
