import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { inventoryService } from '@/services/InventoryService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const reserveItemsSchema = z.object({
  items: z.array(
    z.object({
      batchId: z.string(),
      quantity: z.number().positive(),
    }),
  ),
  expirationMinutes: z.number().default(30),
});

export async function POST(request: Request) {
  try {
    const data = await validateRequestBody(request, reserveItemsSchema);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + data.expirationMinutes);

    const result = await inventoryService.reserveItems(data.items, expiresAt);

    if (!result.success) {
      return createErrorResponse(400, result.error || 'Failed to reserve items', 'RESERVE_ERROR');
    }

    return createSuccessResponse(
      {
        message: 'Items reserved successfully',
        reservations: result.reservations,
      },
      201,
    );
  } catch (error) {
    logger.error(error, 'Failed to process reservation request');
    return createErrorResponse(500, 'Failed to process reservation', 'PROCESS_ERROR');
  }
}
