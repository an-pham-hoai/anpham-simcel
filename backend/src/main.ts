import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // Choose your preferred versioning strategy (URI, Header, Media Type)
  });
  
  await app.listen(3000);
}
bootstrap();
