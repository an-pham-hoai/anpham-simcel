import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory } from './schemas/inventory.schema';
import { successResponse, errorResponse, WrapperResponse } from '../common/wrapper-response';

@Injectable()
export class InventoryService {
  constructor(@InjectModel(Inventory.name) private inventoryModel: Model<Inventory>) {}

  async findAll(page: number, size: number): Promise<WrapperResponse<any>> {
    try {
      const items = await this.inventoryModel
        .find()
        .skip((page - 1) * size)
        .limit(size)
        .exec();
      const total = await this.inventoryModel.countDocuments().exec();
      return successResponse({ items, total });
    } catch (error) {
      return errorResponse('DATABASE_ERROR', 'An error occurred while fetching the inventory items.');
    }
  }

  async findOne(sku: string): Promise<WrapperResponse<Inventory>> {
    const item = await this.inventoryModel.findOne({ sku }).exec();
    if (!item) {
      return errorResponse('ITEM_NOT_FOUND', 'The requested item could not be found.');
    }
    return successResponse(item);
  }

  async create(item: Inventory): Promise<WrapperResponse<Inventory>> {
    try {
      const newItem = new this.inventoryModel(item);
      const savedItem = await newItem.save();
      return successResponse(savedItem);
    } catch (error) {
      return errorResponse('DATABASE_ERROR', 'An error occurred while creating the item.');
    }
  }

  async update(id: string, item: Partial<Inventory>): Promise<WrapperResponse<Inventory>> {
    const updatedItem = await this.inventoryModel.findByIdAndUpdate(id, item, { new: true }).exec();
    if (!updatedItem) {
      return errorResponse('ITEM_NOT_FOUND', 'The item to update was not found.');
    }
    return successResponse(updatedItem);
  }

  async delete(id: string): Promise<WrapperResponse<null>> {
    const result = await this.inventoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      return errorResponse('ITEM_NOT_FOUND', 'The item to delete was not found.');
    }
    return successResponse(null);
  }
}
