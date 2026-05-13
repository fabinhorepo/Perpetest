import { createSuccessResponse, createErrorResponse } from '@/lib/api';
import { catalogService } from '@/services/CatalogService';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const biome = url.searchParams.get('biome');

    const species = await catalogService.getAllSpecies(biome || undefined);

    return createSuccessResponse(
      {
        total: species.length,
        data: species,
      },
      200,
    );
  } catch (error) {
    logger.error(error, 'Failed to fetch species');
    return createErrorResponse(500, 'Failed to fetch species', 'FETCH_SPECIES_ERROR');
  }
}
