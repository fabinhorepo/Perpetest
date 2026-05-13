import { createSuccessResponse, createErrorResponse } from '@/lib/api';
import { catalogService } from '@/services/CatalogService';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const biome = url.searchParams.get('biome');

    const products = await catalogService.getAllProducts(biome || undefined);

    return createSuccessResponse(
      {
        total: products.length,
        data: products,
      },
      200,
    );
  } catch (error) {
    logger.error(error, 'Failed to fetch products');
    return createErrorResponse(500, 'Failed to fetch products', 'FETCH_PRODUCTS_ERROR');
  }
}
