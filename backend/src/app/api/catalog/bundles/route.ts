import { createSuccessResponse, createErrorResponse } from '@/lib/api';
import { catalogService } from '@/services/CatalogService';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const targetBiome = url.searchParams.get('targetBiome');
    const targetObjective = url.searchParams.get('targetObjective');

    const bundles = await catalogService.getAllBundles(
      targetBiome || undefined,
      targetObjective || undefined,
    );

    return createSuccessResponse(
      {
        total: bundles.length,
        data: bundles,
      },
      200,
    );
  } catch (error) {
    logger.error(error, 'Failed to fetch bundles');
    return createErrorResponse(500, 'Failed to fetch bundles', 'FETCH_BUNDLES_ERROR');
  }
}
