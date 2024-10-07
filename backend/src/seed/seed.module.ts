import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from '../inventory/inventory.module';  // Import InventoryModule for dependencies
import { OrderModule } from '../order/order.module';  // Import OrderModule for dependencies
import { SeedService } from './seed.service';  // Import the SeedService

@Module({
    imports: [
        MongooseModule,  // Ensure Mongoose is imported for MongoDB access
        InventoryModule, // Import InventoryModule to use InventoryService for seeding
        OrderModule,     // Import OrderModule to use OrderService for seeding
    ],
    providers: [
        SeedService,
    ],
    exports: [SeedService],    // Export SeedService so other modules can use it
})
export class SeedModule { }
