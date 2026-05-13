import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { CartItem, Cart } from '@prisma/client';

export class CartService {
  async getOrCreateCart(customerId: string, projectId?: string): Promise<Cart> {
    try {
      let cart = await prisma.cart.findUnique({
        where: {
          customerId_projectId: {
            customerId,
            projectId: projectId || '',
          },
        },
        include: { items: true },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            customerId,
            projectId: projectId || null,
          },
          include: { items: true },
        });
      }

      return cart;
    } catch (error) {
      logger.error(error, 'Failed to get or create cart');
      throw error;
    }
  }

  async getCart(cartId: string) {
    try {
      return await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: { include: { species: true } },
              bundle: { include: { items: { include: { species: true } } } },
            },
          },
        },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch cart');
      throw error;
    }
  }

  async addItem(
    cartId: string,
    data: {
      productId?: string;
      bundleId?: string;
      quantity: number;
    },
  ): Promise<CartItem> {
    try {
      if (!data.productId && !data.bundleId) {
        throw new Error('Either productId or bundleId must be provided');
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId,
          ...(data.productId ? { productId: data.productId } : { bundleId: data.bundleId }),
        },
      });

      if (existingItem) {
        return await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + data.quantity,
          },
        });
      }

      return await prisma.cartItem.create({
        data: {
          cartId,
          quantity: data.quantity,
          productId: data.productId || null,
          bundleId: data.bundleId || null,
        },
      });
    } catch (error) {
      logger.error(error, 'Failed to add item to cart');
      throw error;
    }
  }

  async removeItem(itemId: string): Promise<void> {
    try {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } catch (error) {
      logger.error(error, 'Failed to remove item from cart');
      throw error;
    }
  }

  async clearCart(cartId: string): Promise<void> {
    try {
      await prisma.cartItem.deleteMany({
        where: { cartId },
      });
    } catch (error) {
      logger.error(error, 'Failed to clear cart');
      throw error;
    }
  }
}

export const cartService = new CartService();
