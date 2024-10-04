import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/warehouse'),
    InventoryModule,
    OrderModule,
    ReportModule,
    AuthModule
  ],
})
export class AppModule {}
