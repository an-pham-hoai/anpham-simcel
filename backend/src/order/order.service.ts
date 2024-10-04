import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { InventoryService } from '../inventory/inventory.service';
import { WrapperResponse } from 'src/common/wrapper-response';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly inventoryService: InventoryService,
  ) {}

  async createOrder(orderDto: any): Promise<WrapperResponse<Order>> {
    try {
      const createdOrder = new this.orderModel(orderDto);
      await createdOrder.save();

      // Adjust the inventory based on the ordered items
      for (const item of orderDto.items) {
        const inventoryResponse = await this.inventoryService.findOne(item.sku);
        if (!inventoryResponse.success) {
          return {
            success: false,
            error: {
              code: 'ITEM_NOT_FOUND',
              message: `Item with SKU ${item.sku} not found`,
            },
            data: null,
          };
        }

        const inventoryItem = inventoryResponse.data;
        inventoryItem.quantity -= item.quantity;
        await inventoryItem.save();
      }

      return {
        success: true,
        error: null,
        data: createdOrder,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: 'Failed to create order',
        },
        data: null,
      };
    }
  }

  async findOne(orderId: string): Promise<WrapperResponse<Order>> {
    try {
      const order = await this.orderModel.findById(orderId).exec();
      if (!order) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Order with ID ${orderId} not found`,
          },
          data: null,
        };
      }

      return {
        success: true,
        error: null,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ORDER_FETCH_FAILED',
          message: 'Failed to fetch order',
        },
        data: null,
      };
    }
  }

  async getAllOrders(): Promise<WrapperResponse<Order[]>> {
    try {
      const orders = await this.orderModel.find().exec();
      return {
        success: true,
        error: null,
        data: orders,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ORDER_FETCH_FAILED',
          message: 'Failed to fetch orders',
        },
        data: null,
      };
    }
  }

  async updateOrder(orderId: string, updateDto: any): Promise<WrapperResponse<Order>> {
    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(orderId, updateDto, { new: true }).exec();
      if (!updatedOrder) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Order with ID ${orderId} not found`,
          },
          data: null,
        };
      }

      return {
        success: true,
        error: null,
        data: updatedOrder,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ORDER_UPDATE_FAILED',
          message: 'Failed to update order',
        },
        data: null,
      };
    }
  }

  async deleteOrder(orderId: string): Promise<WrapperResponse<null>> {
    try {
      const deletedOrder = await this.orderModel.findByIdAndDelete(orderId).exec();
      if (!deletedOrder) {
        return {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Order with ID ${orderId} not found`,
          },
          data: null,
        };
      }

      return {
        success: true,
        error: null,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ORDER_DELETION_FAILED',
          message: 'Failed to delete order',
        },
        data: null,
      };
    }
  }
}
