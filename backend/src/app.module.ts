import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seed/seed.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the config available globally
      envFilePath: '.env', // Load environment variables from the .env file
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let conn = configService.get<string>('MONGO_CONNECTION_STRING') || 
        process.env.MONGO_CONNECTION_STRING; //mongodb://localhost:27017/simceldb
        console.log('mongodb conn', conn);
        return { uri: conn }
      },
      inject: [ConfigService],
    }),
    // Configure rate limiting globally
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time-to-live for rate limit (in milliseconds)
      limit: 60, // Maximum number of requests within the ttl
    }]),
    InventoryModule,
    OrderModule,
    ReportModule,
    AuthModule,
    SeedModule,
  ],
  providers: [
    // Apply the throttler guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();  // Run seed on startup
  }
}
