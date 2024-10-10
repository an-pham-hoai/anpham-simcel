import { Injectable, Logger } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { OrderService } from 'src/order/order.service';
import { Order } from 'src/order/schemas/order.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly ordersService: OrderService,
  ) { }

  async seed() {
    this.logger.log('Checking if database already seeded...');

    // Check if there is already data in Inventory collection
    const existingItems = await this.inventoryService.findAll(1, 1000);
    if (existingItems.data?.length > 0) {
      this.logger.log('Inventory already seeded. Skipping seeding process.');
    }
    else {
      this.logger.log('No inventories found. Seeding mock data...');

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
    }

    // Check if there is already data in Order collection
    let existingOrders = await this.ordersService.findAll(1, 10000000);
    if (!existingOrders.data) {
      this.logger.log('existingOrders null', existingOrders);
      return;
    }
    existingOrders.data.forEach(async (order: Order) => {
      if (!order.items || order.items.length == 0 || !order.items[0].sku){
        await this.ordersService.deleteOrder(order.id as any);
        this.logger.log('seed delete order', order);
      }
    });

    existingOrders = await this.ordersService.findAll(1, 10000000);
    if (existingOrders.data?.length > 0) {
      this.logger.log('Orders already seeded. Skipping seeding process.');
    }
    else {
      // Mock Orders
      const inventoryItems = await this.inventoryService.findAll(1, 10000000); // Fetch all inventory items
      const itemMap = new Map(); // Map SKU to the Inventory item ObjectId

      for (const item of inventoryItems.data) {
        itemMap.set(item.sku, item._id); // Map SKU to the ObjectId
      }

      const mockOrders = [
        { orderNumber: 'ORD001', customerName: 'John Doe', items: [{ sku: 'SKU001', quantity: 1 }] },
        { orderNumber: 'ORD002', customerName: 'Jane Smith', items: [{ sku: 'SKU002', quantity: 2 }] },
        { orderNumber: 'ORD003', customerName: 'Bob Johnson', items: [{ sku: 'SKU003', quantity: 1 }, { sku: 'SKU004', quantity: 2 }] },
      ];

      // Transform the mock orders to use ObjectId references
      const transformedOrders = mockOrders.map(order => {
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0); // Sum up the quantities

        return {
          ...order,
          items: order.items.map(item => ({
            inventoryId: itemMap.get(item.sku), // Use the ObjectId reference
            sku: item.sku,
            quantity: item.quantity
          })),
          totalQuantity // Add the total quantity
        };
      });

      for (const order of transformedOrders) {
        try {
          await this.ordersService.create(order);
          this.logger.log(`Created order for: ${order.customerName}`);
        } catch (error) {
          this.logger.error(`Failed to create order: ${error.message}`);
        }
      }
    }

    this.logger.log('Seeding complete.');
  }
}
