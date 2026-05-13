import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { pricingService } from '@/services/PricingService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const quoteSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().optional(),
      bundleId: z.string().optional(),
      quantity: z.number().positive(),
    }),
  ),
  customerType: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const data = await validateRequestBody(request, quoteSchema);

    const quote = await pricingService.quoteItems(data.items, data.customerType);

    return createSuccessResponse(quote, 200);
  } catch (error) {
    logger.error(error, 'Failed to generate quote');
    return createErrorResponse(500, (error as Error).message || 'Failed to generate quote', 'QUOTE_ERROR');
  }
}
