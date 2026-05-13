import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export interface QuoteItem {
  productId?: string;
  bundleId?: string;
  quantity: number;
}

export interface PricingQuote {
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description: string;
  }>;
  subtotal: number;
  discounts: number;
  freightCostEstimate: number;
  totalEstimate: number;
}

export class PricingService {
  async getProductPrice(productId: string): Promise<number | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      return product?.basePrice || null;
    } catch (error) {
      logger.error(error, 'Failed to fetch product price');
      throw error;
    }
  }

  async quoteItems(items: QuoteItem[], customerType?: string): Promise<PricingQuote> {
    try {
      const quotedItems: PricingQuote['items'] = [];
      let subtotal = 0;

      for (const item of items) {
        if (item.productId) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { species: true },
          });

          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          const unitPrice = product.basePrice;
          const totalPrice = unitPrice * item.quantity;

          quotedItems.push({
            id: product.id,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            description: `${product.displayName} (${product.species.scientificName})`,
          });

          subtotal += totalPrice;
        } else if (item.bundleId) {
          const bundle = await prisma.bundle.findUnique({
            where: { id: item.bundleId },
            include: {
              items: {
                include: { species: { include: { batches: { take: 1 } } } },
              },
            },
          });

          if (!bundle) {
            throw new Error(`Bundle ${item.bundleId} not found`);
          }

          // Simplified bundle pricing: average price per species * quantity
          let bundlePrice = 0;
          for (const bundleItem of bundle.items) {
            const product = await prisma.product.findFirst({
              where: { speciesId: bundleItem.speciesId },
            });
            if (product) {
              bundlePrice += product.basePrice * (bundleItem.percentageQty / 100);
            }
          }

          const totalPrice = bundlePrice * item.quantity;
          quotedItems.push({
            id: bundle.id,
            quantity: item.quantity,
            unitPrice: bundlePrice,
            totalPrice,
            description: `${bundle.name} (Bundle)`,
          });

          subtotal += totalPrice;
        }
      }

      // Apply volume discount (example: 5% off for orders >= 1000 units)
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      let discounts = 0;
      if (totalQuantity >= 1000) {
        discounts = subtotal * 0.05;
      }

      // Estimate freight (example: R$ 0.50 per seedling)
      const freightCostEstimate = totalQuantity * 0.5;

      return {
        items: quotedItems,
        subtotal,
        discounts,
        freightCostEstimate,
        totalEstimate: subtotal - discounts + freightCostEstimate,
      };
    } catch (error) {
      logger.error(error, 'Failed to quote items');
      throw error;
    }
  }
}

export const pricingService = new PricingService();
