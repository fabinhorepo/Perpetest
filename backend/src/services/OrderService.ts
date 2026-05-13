import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { Order } from '@prisma/client';

export interface CreateOrderInput {
  customerId: string;
  projectId?: string;
  items: Array<{
    productId?: string;
    bundleId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLon?: number;
  freightCost: number;
  freightMethod: string;
  totalAmount: number;
}

export class OrderService {
  async createOrder(data: CreateOrderInput): Promise<Order> {
    try {
      const order = await prisma.order.create({
        data: {
          customerId: data.customerId,
          projectId: data.projectId,
          status: 'NEW',
          totalAmount: data.totalAmount,
          freightCost: data.freightCost,
          freightMethod: data.freightMethod,
          deliveryAddress: data.deliveryAddress,
          deliveryLat: data.deliveryLat,
          deliveryLon: data.deliveryLon,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              bundleId: item.bundleId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
              projectId: data.projectId,
            })),
          },
          history: {
            create: {
              status: 'NEW',
              reason: 'Order created',
            },
          },
        },
        include: {
          items: true,
          history: true,
        },
      });

      return order;
    } catch (error) {
      logger.error(error, 'Failed to create order');
      throw error;
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      return await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          history: true,
          payment: true,
        },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch order');
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    reason?: string,
  ): Promise<Order> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          history: {
            create: {
              status,
              reason,
            },
          },
        },
        include: {
          items: true,
          history: true,
        },
      });

      return order;
    } catch (error) {
      logger.error(error, 'Failed to update order status');
      throw error;
    }
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      return await prisma.order.findMany({
        where: { customerId },
        include: {
          items: true,
          history: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch customer orders');
      throw error;
    }
  }
}

export const orderService = new OrderService();
