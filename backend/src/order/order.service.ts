import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, SortOrder } from 'mongoose';
import { Order } from './schemas/order.schema';
import { InventoryService } from '../inventory/inventory.service';
import { WrapperResponse } from 'src/common/wrapper-response';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly inventoryService: InventoryService,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    try {
      // Step 0: Fetch the corresponding inventory items by SKU
      const { orderNumber, customerName, items } = createOrderDto;

      const inventoryIds = [];
      let totalQuantity = 0;

      for (const item of items) {
        const inventoryItem = await this.inventoryService.findOne(item.sku);  // Find inventory by SKU
        if (!inventoryItem.data) {
          throw new Error(`Inventory item with SKU ${item.sku} not found`);
        }

        inventoryIds.push({
          _id: inventoryItem.data._id,   // Use ObjectId reference
          quantity: item.quantity,  // Keep the quantity from the order
        });

        totalQuantity += item.quantity;  // Sum up totalQuantity
      }

      // Construct the new order with inventory ObjectId references
      const newOrder = new this.orderModel({
        orderNumber,
        customerName,
        items: inventoryIds.map(item => item._id),  // Extract only ObjectId references for items
        totalQuantity,
        status: 'pending',  // Set default status as 'pending'
        orderDate: new Date(),
      });

      // 1. Save the order
      const createdOrder = await newOrder.save();

      // 2. Update the inventory quantities
      for (const item of createOrderDto.items) {
        const inventoryItem = await this.inventoryService.findOne(item.sku);

        if (!inventoryItem.data) {
          // Return a structured error response if inventory item is not found
          return {
            success: false,
            data: null,
            error: {
              code: 'ITEM_NOT_FOUND',
              message: `Inventory item with SKU ${item.sku} not found.`,
            },
          };
        }

        // Check if there's enough stock before deduction
        if (inventoryItem.data.quantity < item.quantity) {
          return {
            success: false,
            data: null,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `Insufficient stock for item with SKU ${item.sku}.`,
            },
          };
        }

        // Deduct the quantity from the inventory
        inventoryItem.data.quantity -= item.quantity;

        // Save the updated inventory item 
        await inventoryItem.data.save();
      }

      return {
        success: true,
        data: createdOrder,
        error: null,
      };

    } catch (error) {
      this.logger.log(error);

      return {
        success: false,
        data: null,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: error.message || 'Order creation failed due to an internal error.',
        },
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

  /**
   * Find all orders with pagination, sorting, and optional search.
   * @param page The page number (default is 1).
   * @param size The number of items per page (default is 10).
   * @param sortBy The field to sort by (default is 'createdAt').
   * @param sortOrder The sort order ('asc' for ascending, 'desc' for descending).
   * @param search Optional search term to filter items by customer name, order number, or status.
   */
  async findAll(
    page: number = 1,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: string = 'asc',
    search: string = ''
  ): Promise<any> {
    try {
      const skip = (page - 1) * size;

      // Build the filter object to search by customer name, order number, or status
      const filter = search
        ? {
          $or: [
            { customerName: { $regex: search, $options: 'i' } },   // Case-insensitive search for customer name
            { orderNumber: { $regex: search, $options: 'i' } },    // Case-insensitive search for order number
            { status: { $regex: search, $options: 'i' } },         // Case-insensitive search for order status
          ],
        }
        : {};

      // Build sort options
      const sortOptions = { [sortBy]: sortOrder === 'asc' ? <SortOrder>'asc' : 'desc' };

      // Fetch the total count of orders that match the filter (before pagination)
      const totalItems = await this.orderModel.countDocuments(filter).exec();

      // Fetch the orders from the database with pagination, filtering, and sorting
      const orders = await this.orderModel
        .find(filter)
        .sort(sortOptions)
        .limit(size)
        .skip(skip)
        .populate('items', 'sku price') // Populate the items field with actual inventory data
        .exec();

      //console.log('orders', orders);

      const formattedOrders = orders.map(order => {
        return {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalQuantity: order.totalQuantity,
          orderDate: order.orderDate,
          status: order.status,
          items: order.items.map(item => ({
            sku: item.sku,
            quantity: item.quantity,  // You need to ensure `quantity` is part of the `items` array in the Order schema
          })),
        };
      });

      // Return success response including totalItems count
      return {
        success: true,
        data: formattedOrders,
        totalItems,   // Include total items count in the response
        error: null,
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'An error occurred while fetching orders.',
        },
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
