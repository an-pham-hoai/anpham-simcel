import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';  // For basic security hardening
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

const allowedOrigins = [
  'http://localhost:4200',
  'http://example.com',
  'http://another-example.com',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the specified origins
  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Helmet for securing HTTP headers
  app.use(helmet());

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

  // Setup Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Inventory and Order API')
    .setDescription('API documentation for Inventory and Order management system')
    .setVersion('1.0')
    .addBearerAuth()  // Adds JWT Bearer token authentication to Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  /* app.use('/api/docs', (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(403).send('Access denied');
    }
    next();
  }); */

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,  // Keep the authorization after refreshing the page
    },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000; // Default to 3000 if not specified
  await app.listen(port);
}
bootstrap();
