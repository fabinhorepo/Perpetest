import { createSuccessResponse } from '@/lib/api';

export async function GET() {
  return createSuccessResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'perpetest-backend',
  });
}
