import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { Reservation } from '@prisma/client';

export class InventoryService {
  async reserveItems(
    items: Array<{
      batchId: string;
      quantity: number;
    }>,
    expiresAt: Date,
  ): Promise<{ success: boolean; reservations?: Reservation[]; error?: string }> {
    try {
      const reservations: Reservation[] = [];

      for (const item of items) {
        const stock = await prisma.nurseryStock.findUnique({
          where: { batchId: item.batchId },
        });

        if (!stock) {
          return {
            success: false,
            error: `Stock not found for batch ${item.batchId}`,
          };
        }

        const availableToReserve = stock.availableQty - stock.reservedQty;

        if (availableToReserve < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for batch ${item.batchId}. Available: ${availableToReserve}, Requested: ${item.quantity}`,
          };
        }

        // Create reservation
        const reservation = await prisma.reservation.create({
          data: {
            stockId: stock.id,
            quantity: item.quantity,
            expiresAt,
            status: 'ACTIVE',
          },
        });

        // Update reserved quantity
        await prisma.nurseryStock.update({
          where: { id: stock.id },
          data: {
            reservedQty: {
              increment: item.quantity,
            },
          },
        });

        reservations.push(reservation);
      }

      return { success: true, reservations };
    } catch (error) {
      logger.error(error, 'Failed to reserve items');
      return {
        success: false,
        error: 'Failed to reserve items',
      };
    }
  }

  async confirmReservations(reservationIds: string[]): Promise<boolean> {
    try {
      await prisma.reservation.updateMany({
        where: { id: { in: reservationIds } },
        data: { status: 'CONFIRMED' },
      });
      return true;
    } catch (error) {
      logger.error(error, 'Failed to confirm reservations');
      throw error;
    }
  }

  async releaseReservations(reservationIds: string[]): Promise<boolean> {
    try {
      const reservations = await prisma.reservation.findMany({
        where: { id: { in: reservationIds } },
      });

      for (const reservation of reservations) {
        // Update reserved quantity
        await prisma.nurseryStock.update({
          where: { id: reservation.stockId },
          data: {
            reservedQty: {
              decrement: reservation.quantity,
            },
          },
        });
      }

      await prisma.reservation.updateMany({
        where: { id: { in: reservationIds } },
        data: { status: 'RELEASED' },
      });

      return true;
    } catch (error) {
      logger.error(error, 'Failed to release reservations');
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
