import pino from 'pino';

const transport = process.env.NODE_ENV === 'development' 
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    })
  : pino.transport({
      target: 'pino/file',
    });

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);
