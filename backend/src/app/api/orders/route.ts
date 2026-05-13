import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { orderService } from '@/services/OrderService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerId: z.string(),
  projectId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      bundleId: z.string().optional(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
    }),
  ),
  deliveryAddress: z.string(),
  deliveryLat: z.number().optional(),
  deliveryLon: z.number().optional(),
  freightCost: z.number().nonnegative(),
  freightMethod: z.string(),
  totalAmount: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const data = await validateRequestBody(request, createOrderSchema);

    const order = await orderService.createOrder(data);

    return createSuccessResponse(order, 201);
  } catch (error) {
    logger.error(error, 'Failed to create order');
    return createErrorResponse(500, 'Failed to create order', 'CREATE_ORDER_ERROR');
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return createErrorResponse(400, 'customerId is required', 'MISSING_PARAMETER');
    }

    const orders = await orderService.getCustomerOrders(customerId);

    return createSuccessResponse(
      {
        total: orders.length,
        data: orders,
      },
      200,
    );
  } catch (error) {
    logger.error(error, 'Failed to fetch orders');
    return createErrorResponse(500, 'Failed to fetch orders', 'FETCH_ORDERS_ERROR');
  }
}
