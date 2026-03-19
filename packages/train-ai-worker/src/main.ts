import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  const port = process.env.PORT ?? 8001;
  await app.listen(port);
  console.log(`Train AI Worker listening on :${port}`);

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received – shutting down gracefully…');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start Train AI Worker:', error);
  process.exit(1);
});