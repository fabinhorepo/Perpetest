import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { Project } from '@prisma/client';

export class ProjectService {
  async createProject(data: {
    customerId: string;
    name: string;
    description?: string;
    biome: string;
    soilType?: string;
    areaSizeHa: number;
    objective: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Project> {
    try {
      return await prisma.project.create({
        data,
      });
    } catch (error) {
      logger.error(error, 'Failed to create project');
      throw error;
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      return await prisma.project.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch project');
      throw error;
    }
  }

  async getCustomerProjects(customerId: string): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error(error, 'Failed to fetch customer projects');
      throw error;
    }
  }

  async updateProject(
    id: string,
    data: Partial<Project>,
  ): Promise<Project> {
    try {
      return await prisma.project.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error(error, 'Failed to update project');
      throw error;
    }
  }
}

export const projectService = new ProjectService();
