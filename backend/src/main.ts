import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // Choose your preferred versioning strategy (URI, Header, Media Type)
  });

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,   // Strip out properties that are not defined in DTO
    forbidNonWhitelisted: true,  // Throw an error if a non-whitelisted property is sent
    transform: true,   // Automatically transform payloads to DTOs
  }));
  
  await app.listen(3000);
}
bootstrap();
