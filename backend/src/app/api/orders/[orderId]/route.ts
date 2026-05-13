import { createSuccessResponse, createErrorResponse } from '@/lib/api';
import { orderService } from '@/services/OrderService';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    const order = await orderService.getOrder(params.orderId);

    if (!order) {
      return createErrorResponse(404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    return createSuccessResponse(order, 200);
  } catch (error) {
    logger.error(error, 'Failed to fetch order');
    return createErrorResponse(500, 'Failed to fetch order', 'FETCH_ORDER_ERROR');
  }
}
