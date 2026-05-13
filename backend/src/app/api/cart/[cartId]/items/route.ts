import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { cartService } from '@/services/CartService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const addItemSchema = z.object({
  productId: z.string().optional(),
  bundleId: z.string().optional(),
  quantity: z.number().positive(),
});

export async function POST(
  request: Request,
  { params }: { params: { cartId: string } },
) {
  try {
    const data = await validateRequestBody(request, addItemSchema);

    if (!data.productId && !data.bundleId) {
      return createErrorResponse(
        400,
        'Either productId or bundleId must be provided',
        'INVALID_REQUEST',
      );
    }

    const item = await cartService.addItem(params.cartId, data);
    const cart = await cartService.getCart(params.cartId);

    return createSuccessResponse(
      {
        item,
        cart,
      },
      201,
    );
  } catch (error) {
    logger.error(error, 'Failed to add item to cart');
    return createErrorResponse(500, 'Failed to add item to cart', 'ADD_ITEM_ERROR');
  }
}
