import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { checkoutService } from '@/services/CheckoutService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const confirmCheckoutSchema = z.object({
  cartId: z.string(),
  customerId: z.string(),
  projectId: z.string().optional(),
  deliveryAddress: z.string(),
  deliveryLat: z.number().optional(),
  deliveryLon: z.number().optional(),
  freightOption: z.enum(['ECONOMICAL', 'EXPRESS', 'DEDICATED']),
  paymentMethod: z.enum(['PIX', 'CARD', 'BOLETO']),
});

export async function POST(request: Request) {
  try {
    const data = await validateRequestBody(request, confirmCheckoutSchema);

    const result = await checkoutService.confirmCheckout(data);

    return createSuccessResponse(result, 201);
  } catch (error) {
    logger.error(error, 'Failed to confirm checkout');
    return createErrorResponse(500, (error as Error).message || 'Failed to confirm checkout', 'CONFIRM_ERROR');
  }
}
