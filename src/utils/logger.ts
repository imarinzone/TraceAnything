export const logger = {
  log: async (level: string, message: string, context?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level,
      message,
      timestamp,
      context,
    };

    console.log(`[${level}] ${message}`, context || '');

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  },

  info: (message: string, context?: any) => logger.log('INFO', message, context),
  warn: (message: string, context?: any) => logger.log('WARN', message, context),
  error: (message: string, context?: any) => logger.log('ERROR', message, context),
};
