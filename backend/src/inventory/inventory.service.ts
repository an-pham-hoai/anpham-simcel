import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Inventory } from './schemas/inventory.schema';
import { successResponse, errorResponse, WrapperResponse } from '../common/wrapper-response';

@Injectable()
export class InventoryService {
  constructor(@InjectModel(Inventory.name) private inventoryModel: Model<Inventory>) { }

  /**
   * Find all inventory items with pagination, sorting, and optional search.
   * @param page The page number (default is 1).
   * @param size The number of items per page (default is 10).
   * @param sortBy The field to sort by (default is 'createdAt').
   * @param sortOrder The sort order ('asc' for ascending, 'desc' for descending).
   * @param search Optional search term to filter items by name, sku, or location.
   */
  async findAll(
    page: number = 1,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: string = 'asc',
    search: string = '',
  ): Promise<any> {
    try {
      const skip = (page - 1) * size;

      // Build the filter object to search by name, sku, or location
      const filter = search
        ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },      // Case-insensitive search for name
            { sku: { $regex: search, $options: 'i' } },       // Case-insensitive search for sku
            { location: { $regex: search, $options: 'i' } },  // Case-insensitive search for location
          ],
        }
        : {};

      // Build sort options
      const sortOptions = { [sortBy]: sortOrder === 'asc' ? <SortOrder>'asc' : 'desc' };

      // Fetch the total count of items that match the filter (before pagination)
      const totalItems = await this.inventoryModel.countDocuments(filter).exec();

      // Fetch the inventory items from the database with pagination, filtering, and sorting
      const items = await this.inventoryModel
        .find(filter)
        .sort(sortOptions)
        .limit(size)
        .skip(skip)
        .exec();

      // Return success response including totalItems count
      return {
        success: true,
        data: items,
        totalItems,   // Include total items count in the response
        error: null,
      };
    } catch (error) {
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

  async findOne(sku: string): Promise<WrapperResponse<Inventory>> {
    const item = await this.inventoryModel.findOne({ sku }).exec();
    if (!item) {
      return errorResponse('ITEM_NOT_FOUND', 'The requested item could not be found.');
    }
    return successResponse(item);
  }

  async create(item: any): Promise<WrapperResponse<Inventory>> {
    try {
      const existingItem = await this.inventoryModel.findOne({ sku: item.sku }).exec();
      if (existingItem) {
        return errorResponse('SKU_EXISTS', 'An item with the provided SKU already exists.');
      }

      const newItem = new this.inventoryModel(item);
      const savedItem = await newItem.save();
      return successResponse(savedItem);
    } catch (error) {
      return errorResponse('DATABASE_ERROR', 'An error occurred while creating the item.');
    }
  }

  async update(sku: string, updateData: Partial<Inventory>): Promise<WrapperResponse<Inventory>> {
    const inventoryItem = await this.inventoryModel.findOneAndUpdate({ sku }, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validators are run
    });

    if (!inventoryItem) {
      return errorResponse('ITEM_NOT_FOUND', 'The item to update was not found.');
    }

    return successResponse(inventoryItem);
  }

  async delete(sku: string): Promise<WrapperResponse<null>> {
    const result = await this.inventoryModel.findOneAndDelete({ sku }); // Use SKU instead of _id

    if (!result) {
      return errorResponse('ITEM_NOT_FOUND', 'The item to delete was not found.');
    }
    return successResponse(null);
  }

  // Method to check if a SKU is unique
  async isSkuUnique(sku: string): Promise<boolean> {
    const inventoryItem = await this.inventoryModel.findOne({ sku: { $regex: new RegExp(`^${sku}$`, 'i') } }).exec();
    // Return true if SKU is unique (i.e., not found in the database)
    return !inventoryItem;
  }

  // Fetch available SKUs from inventory
  async getAvailableSkus(): Promise<string[]> {
    const inventoryItems = await this.inventoryModel.find({}, { sku: 1 }).exec();  // Get only the SKU field
    //console.log('getAvailableSkus', inventoryItems);
    return inventoryItems.map(item => item.sku);
  }
}
