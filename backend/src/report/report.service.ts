import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory } from '../inventory/schemas/inventory.schema';
import { Order } from '../order/schemas/order.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async getInventoryReport() {
    const inventoryLevels = await this.inventoryModel.find().exec();
    const lowStockItems = await this.inventoryModel.find({ quantity: { $lt: 10 } }).exec(); // Customize the threshold

    return {
      inventoryLevels,
      lowStockItems,
    };
  }

  async getSalesReport() {
    const salesHistory = await this.orderModel.aggregate([
      {
        $group: {
          _id: { month: { $month: '$orderDate' }, year: { $year: '$orderDate' } },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$totalQuantity' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]).exec();

    return salesHistory;
  }
}
