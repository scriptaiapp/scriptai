import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  const port = process.env.PORT ?? 8001;
  await app.listen(port);
  console.log(`Train AI Worker started (health :${port})`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Train AI Worker:', error);
  process.exit(1);
});

export const handler = bootstrap;
export default bootstrap;