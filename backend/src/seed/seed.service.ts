import { Injectable, Logger } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly ordersService: OrderService,
  ) {}

  async seed() {
    this.logger.log('Checking if database already seeded...');

    // Check if there is already data in Inventory collection
    const existingItems = await this.inventoryService.findAll(1, 1000);
    if (existingItems.data?.length > 0) {
      this.logger.log('Inventory already seeded. Skipping seeding process.');
      return;
    }

    // Check if there is already data in Order collection
    const existingOrders = await this.ordersService.findAll();
    if (existingOrders.length > 0) {
      this.logger.log('Orders already seeded. Skipping seeding process.');
      return;
    }

    this.logger.log('No data found. Seeding mock data...');

    // Mock Inventory Items
    const mockItems = [
      { name: 'Laptop', sku: 'SKU001', quantity: 100, location: 'Warehouse A' },
      { name: 'Monitor', sku: 'SKU002', quantity: 50, location: 'Warehouse B' },
      { name: 'Keyboard', sku: 'SKU003', quantity: 200, location: 'Warehouse A' },
      { name: 'Mouse', sku: 'SKU004', quantity: 300, location: 'Warehouse C' },
      { name: 'Headphones', sku: 'SKU005', quantity: 150, location: 'Warehouse A' },
    ];

    for (const item of mockItems) {
      try {
        await this.inventoryService.create(item);
        this.logger.log(`Inserted inventory item: ${item.name}`);
      } catch (error) {
        this.logger.error(`Failed to insert inventory item ${item.sku}: ${error.message}`);
      }
    }

    // Mock Orders
    const mockOrders = [
      { orderNumber: 'ORD001', customerName: 'John Doe', items: [{ sku: 'SKU001', quantity: 1 }] },
      { orderNumber: 'ORD002', customerName: 'Jane Smith', items: [{ sku: 'SKU002', quantity: 2 }] },
      { orderNumber: 'ORD003', customerName: 'Bob Johnson', items: [{ sku: 'SKU003', quantity: 1 }, { sku: 'SKU004', quantity: 2 }] },
    ];

    for (const order of mockOrders) {
      try {
        await this.ordersService.create(order);
        this.logger.log(`Created order for: ${order.customerName}`);
      } catch (error) {
        this.logger.error(`Failed to create order: ${error.message}`);
      }
    }

    this.logger.log('Seeding complete.');
  }
}
