import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { checkoutService } from '@/services/CheckoutService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const prepareCheckoutSchema = z.object({
  cartId: z.string(),
  deliveryAddress: z.string(),
  deliveryLat: z.number().optional(),
  deliveryLon: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const data = await validateRequestBody(request, prepareCheckoutSchema);

    const result = await checkoutService.prepareCheckout(data);

    return createSuccessResponse(result, 200);
  } catch (error) {
    logger.error(error, 'Failed to prepare checkout');
    return createErrorResponse(500, (error as Error).message || 'Failed to prepare checkout', 'PREPARE_ERROR');
  }
}
