import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { inventoryService } from './InventoryService';
import { orderService, CreateOrderInput } from './OrderService';
import { pricingService } from './PricingService';
import { cartService } from './CartService';

export interface CheckoutPrepareInput {
  cartId: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLon?: number;
}

export interface CheckoutConfirmInput {
  cartId: string;
  customerId: string;
  projectId?: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLon?: number;
  freightOption: 'ECONOMICAL' | 'EXPRESS' | 'DEDICATED';
  paymentMethod: 'PIX' | 'CARD' | 'BOLETO';
}

export class CheckoutService {
  async prepareCheckout(input: CheckoutPrepareInput) {
    try {
      const cart = await cartService.getCart(input.cartId);

      if (!cart) {
        throw new Error('Cart not found');
      }

      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Quote items
      const quoteItems = cart.items.map((item) => ({
        productId: item.productId || undefined,
        bundleId: item.bundleId || undefined,
        quantity: item.quantity,
      }));

      const pricing = await pricingService.quoteItems(quoteItems);

      // Return shipping options
      const shippingOptions = this.calculateShippingOptions(
        pricing.freightCostEstimate,
        input.deliveryLat,
        input.deliveryLon,
      );

      return {
        pricing,
        shippingOptions,
        cartItems: cart.items,
      };
    } catch (error) {
      logger.error(error, 'Failed to prepare checkout');
      throw error;
    }
  }

  private calculateShippingOptions(
    baseCost: number,
    _lat?: number,
    _lon?: number,
  ): Array<{
    id: string;
    name: string;
    cost: number;
    estimatedDays: number;
  }> {
    return [
      {
        id: 'ECONOMICAL',
        name: 'Econômico (7-14 dias)',
        cost: baseCost,
        estimatedDays: 10,
      },
      {
        id: 'EXPRESS',
        name: 'Expresso (3-5 dias)',
        cost: baseCost * 1.5,
        estimatedDays: 4,
      },
      {
        id: 'DEDICATED',
        name: 'Dedicado (1-2 dias)',
        cost: baseCost * 3,
        estimatedDays: 1,
      },
    ];
  }

  async confirmCheckout(input: CheckoutConfirmInput) {
    const transactionLog: string[] = [];

    try {
      transactionLog.push('Starting checkout confirmation...');

      // 1. Get cart
      const cart = await cartService.getCart(input.cartId);
      if (!cart) throw new Error('Cart not found');
      transactionLog.push('Cart fetched');

      // 2. Quote items again for validation
      const quoteItems = cart.items.map((item) => ({
        productId: item.productId || undefined,
        bundleId: item.bundleId || undefined,
        quantity: item.quantity,
      }));

      const pricing = await pricingService.quoteItems(quoteItems);
      transactionLog.push('Pricing calculated');

      // 3. Calculate freight cost based on selected option
      const shippingOptions = this.calculateShippingOptions(pricing.freightCostEstimate);
      const selectedShipping = shippingOptions.find((o) => o.id === input.freightOption);
      const freightCost = selectedShipping?.cost || pricing.freightCostEstimate;

      // 4. Try to reserve inventory
      const cartItemsForReservation = cart.items.map(async (item) => {
        if (item.productId) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { species: { include: { batches: { take: 1 } } } },
          });

          if (product?.species.batches[0]) {
            return {
              batchId: product.species.batches[0].id,
              quantity: item.quantity,
            };
          }
        }
        return null;
      });

      const reservationItems = (await Promise.all(cartItemsForReservation)).filter(
        (i): i is { batchId: string; quantity: number } => i !== null,
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      if (reservationItems.length > 0) {
        const reservationResult = await inventoryService.reserveItems(
          reservationItems,
          expiresAt,
        );

        if (!reservationResult.success) {
          throw new Error(reservationResult.error || 'Failed to reserve inventory');
        }

        transactionLog.push(`Inventory reserved: ${reservationResult.reservations?.length} items`);

        // 5. Create order
        const orderInput: CreateOrderInput = {
          customerId: input.customerId,
          projectId: input.projectId,
          items: cart.items.map((item) => ({
            productId: item.productId,
            bundleId: item.bundleId,
            quantity: item.quantity,
            unitPrice: pricing.items.find((p) => p.id === (item.productId || item.bundleId))
              ?.unitPrice || 0,
          })),
          deliveryAddress: input.deliveryAddress,
          deliveryLat: input.deliveryLat,
          deliveryLon: input.deliveryLon,
          freightCost,
          freightMethod: input.freightOption,
          totalAmount: pricing.totalEstimate - pricing.discounts + freightCost,
        };

        const order = await orderService.createOrder(orderInput);
        transactionLog.push(`Order created: ${order.id}`);

        // 6. Create payment record
        const payment = await prisma.payment.create({
          data: {
            orderId: order.id,
            method: input.paymentMethod,
            status: 'PENDING',
            amount: order.totalAmount,
          },
        });

        transactionLog.push(`Payment initiated: ${payment.id}`);

        // 7. Update order status and confirm reservations
        await orderService.updateOrderStatus(order.id, 'RESERVED', 'Inventory reserved');
        if (reservationResult.reservations) {
          await inventoryService.confirmReservations(
            reservationResult.reservations.map((r) => r.id),
          );
        }
        transactionLog.push('Order status updated to RESERVED');

        // 8. Clear cart
        await cartService.clearCart(input.cartId);
        transactionLog.push('Cart cleared');

        return {
          success: true,
          order,
          payment,
          transactionLog,
        };
      } else {
        throw new Error('No valid inventory items to reserve');
      }
    } catch (error) {
      logger.error(error, 'Checkout failed', { transactionLog });
      throw error;
    }
  }
}

export const checkoutService = new CheckoutService();
