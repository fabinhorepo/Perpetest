import { z } from 'zod';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createErrorResponse = (
  statusCode: number,
  message: string,
  code?: string,
) => {
  return new Response(
    JSON.stringify({
      error: {
        code: code || `ERROR_${statusCode}`,
        message,
      },
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};

export const createSuccessResponse = <T>(data: T, statusCode = 200) => {
  return new Response(JSON.stringify({ data }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const validateRequestBody = async <T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> => {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, 'Invalid request body', 'VALIDATION_ERROR');
    }
    throw new ApiError(400, 'Failed to parse request body', 'PARSE_ERROR');
  }
};
