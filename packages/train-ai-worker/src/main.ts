import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  });
  await app.init();
  // Keep process alive forever
  process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  console.log('Train AI Worker initialized successfully');
}

bootstrap().catch((error) => {
  console.error('Failed to start Train AI Worker:', error);
  process.exit(1);
});

export const handler = bootstrap;
export default bootstrap;