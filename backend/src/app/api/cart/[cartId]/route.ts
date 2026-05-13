import { createSuccessResponse, createErrorResponse } from '@/lib/api';
import { cartService } from '@/services/CartService';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { cartId: string } },
) {
  try {
    const cart = await cartService.getCart(params.cartId);

    if (!cart) {
      return createErrorResponse(404, 'Cart not found', 'CART_NOT_FOUND');
    }

    return createSuccessResponse(cart, 200);
  } catch (error) {
    logger.error(error, 'Failed to fetch cart');
    return createErrorResponse(500, 'Failed to fetch cart', 'FETCH_CART_ERROR');
  }
}
