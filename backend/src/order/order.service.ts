import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, SortOrder } from 'mongoose';
import { Order } from './schemas/order.schema';
import { InventoryService } from '../inventory/inventory.service';
import { WrapperResponse } from 'src/common/wrapper-response';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly inventoryService: InventoryService,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const session: ClientSession = await this.orderModel.db.startSession(); // Start a session

    try {
      // Begin the transaction
      session.startTransaction();

      // 1. Create the order
      const newOrder = new this.orderModel(createOrderDto);
      const createdOrder = await newOrder.save({ session });

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

        // Save the updated inventory item within the transaction
        await inventoryItem.data.save({ session });
      }

      // Commit the transaction if everything goes well
      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        data: createdOrder,
        error: null,
      };

    } catch (error) {
      // If something went wrong, abort the transaction
      await session.abortTransaction();
      session.endSession();

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

  async findAll(
    page: number = 1,   // Default to page 1
    size: number = 10,  // Default size to 10 items per page
    sortBy: string = 'createdAt', // Default sort by createdAt field
    sortOrder: string = 'asc',    // Default sort order is ascending
    search: string = '',          // Optional search term for filtering
  ): Promise<any> {
    try {
      const skip = (page - 1) * size;
      const sortOptions = { [sortBy]: sortOrder === 'asc' ? <SortOrder>'asc' : <SortOrder>'desc' };

      // Build the filter query based on search input
      const searchQuery = search
        ? {
          $or: [
            { orderNumber: { $regex: search, $options: 'i' } },  // Case-insensitive search on orderNumber
            { customerName: { $regex: search, $options: 'i' } }, // Case-insensitive search on customerName
            { status: { $regex: search, $options: 'i' } },       // Case-insensitive search on status
          ],
        }
        : {};

      // Get total count of documents with the search filter applied
      const total = await this.orderModel.countDocuments(searchQuery);

      // Get paginated and filtered data
      const items = await this.orderModel
        .find(searchQuery)
        .skip(skip)   // Skip the first 'n' documents
        .limit(size)  // Limit the number of results
        .sort(sortOptions) // Sort by the specified field and order
        .exec();

      // Return success response
      return {
        success: true,
        data: items,
        error: null,
      };
    }
    catch (error) {
      // Handle any errors during fetching
      return {
        success: false,
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'An error occurred while fetching inventory items.',
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
