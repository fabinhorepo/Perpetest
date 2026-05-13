import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { Species, Product, Bundle } from '@prisma/client';

export class CatalogService {
  async getAllSpecies(biome?: string): Promise<Species[]> {
    try {
      const species = await prisma.species.findMany({
        where: biome ? { biome } : undefined,
        orderBy: { commonName: 'asc' },
      });
      return species;
    } catch (error) {
      logger.error(error, 'Failed to fetch species');
      throw error;
    }
  }

  async getSpeciesById(id: string): Promise<Species | null> {
    try {
      return await prisma.species.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch species by id');
      throw error;
    }
  }

  async createSpecies(data: {
    scientificName: string;
    commonName: string;
    biome: string;
    ecologicalGroup: string;
    growthSpeedMonths: number;
    shadeTolerance: string;
    notes?: string;
    photoUrl?: string;
  }): Promise<Species> {
    try {
      return await prisma.species.create({
        data,
      });
    } catch (error) {
      logger.error(error, 'Failed to create species');
      throw error;
    }
  }

  async getAllProducts(biome?: string): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        include: {
          species: true,
        },
        where: biome
          ? {
              species: { biome },
            }
          : undefined,
        orderBy: { displayName: 'asc' },
      });
      return products;
    } catch (error) {
      logger.error(error, 'Failed to fetch products');
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          species: true,
        },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch product by id');
      throw error;
    }
  }

  async createProduct(data: {
    speciesId: string;
    displayName: string;
    description?: string;
    photoUrl?: string;
    basePrice: number;
  }): Promise<Product> {
    try {
      return await prisma.product.create({
        data,
        include: { species: true },
      });
    } catch (error) {
      logger.error(error, 'Failed to create product');
      throw error;
    }
  }

  async getAllBundles(targetBiome?: string, targetObjective?: string): Promise<Bundle[]> {
    try {
      const bundles = await prisma.bundle.findMany({
        where: {
          ...(targetBiome && { targetBiome }),
          ...(targetObjective && { targetObjective }),
        },
        include: {
          items: {
            include: { species: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      return bundles;
    } catch (error) {
      logger.error(error, 'Failed to fetch bundles');
      throw error;
    }
  }

  async getBundleById(id: string): Promise<Bundle | null> {
    try {
      return await prisma.bundle.findUnique({
        where: { id },
        include: {
          items: {
            include: { species: true },
          },
        },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch bundle by id');
      throw error;
    }
  }
}

export const catalogService = new CatalogService();
