import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/lib/api';
import { projectService } from '@/services/ProjectService';
import { cartService } from '@/services/CartService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createProjectSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  biome: z.string().min(1),
  soilType: z.string().optional(),
  areaSizeHa: z.number().positive(),
  objective: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const data = await validateRequestBody(request, createProjectSchema);
    const project = await projectService.createProject(data);

    // Also create a cart for this project
    const cart = await cartService.getOrCreateCart(data.customerId, project.id);

    return createSuccessResponse(
      {
        project,
        cart: { id: cart.id },
      },
      201,
    );
  } catch (error) {
    logger.error(error, 'Failed to create project');
    return createErrorResponse(500, 'Failed to create project', 'CREATE_PROJECT_ERROR');
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return createErrorResponse(400, 'customerId is required', 'MISSING_PARAMETER');
    }

    const projects = await projectService.getCustomerProjects(customerId);

    return createSuccessResponse(
      {
        total: projects.length,
        data: projects,
      },
      200,
    );
  } catch (error) {
    logger.error(error, 'Failed to fetch projects');
    return createErrorResponse(500, 'Failed to fetch projects', 'FETCH_PROJECTS_ERROR');
  }
}
