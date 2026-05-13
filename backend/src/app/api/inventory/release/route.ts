import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { inventoryService } from '@/services/InventoryService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const releaseItemsSchema = z.object({
  reservationIds: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const data = await validateRequestBody(request, releaseItemsSchema);

    const success = await inventoryService.releaseReservations(data.reservationIds);

    if (!success) {
      return createErrorResponse(500, 'Failed to release reservations', 'RELEASE_ERROR');
    }

    return createSuccessResponse(
      {
        message: 'Items released successfully',
      },
      200,
    );
  } catch (error) {
    logger.error(error, 'Failed to release items');
    return createErrorResponse(500, 'Failed to release items', 'RELEASE_ERROR');
  }
}
