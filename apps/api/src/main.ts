import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const isWorker = process.env.NODE_ENV === 'worker';

  if (isWorker) {
    await app.init();
    console.log('Worker initialized successfully');
  } else {
    app.setGlobalPrefix('api/v1', {
      exclude: ['/'],
    });

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Creator AI API')
      .setDescription('Backend API for Creator AI platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('health', 'Health check endpoints')
      .addTag('auth', 'Authentication & password reset')
      .addTag('billing', 'Plans, subscriptions & checkout')
      .addTag('admin', 'Admin management')
      .addTag('course', 'AI course generation')
      .addTag('ideation', 'Content ideation')
      .addTag('referral', 'Referral system')
      .addTag('sales-rep', 'Sales representative portal')
      .addTag('script', 'Script generation')
      .addTag('story-builder', 'Story builder')
      .addTag('subtitle', 'Subtitle management')
      .addTag('support', 'Support & issue reporting')
      .addTag('thumbnail', 'Thumbnail generation')
      .addTag('train-ai', 'AI training')
      .addTag('upload', 'File uploads')
      .addTag('youtube', 'YouTube integration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    const allowedOrigins = [
      process.env.FRONTEND_DEV_URL,
      process.env.FRONTEND_PROD_URL,
      "*",
    ];

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    });

    await app.listen(process.env.PORT || 8000, () => {
      console.log(`API Server running on port ${process.env.PORT || 8000}`);
      console.log(`Swagger docs available at http://localhost:${process.env.PORT || 8000}/api/docs`);
    });
  }
}
bootstrap();