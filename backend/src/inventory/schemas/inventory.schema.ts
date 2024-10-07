import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })  // Enable timestamps
export class Inventory extends Document {
  @Prop({ required: true, index: true })  // Add index for name-based queries
  name: string;

  @Prop({ required: true, unique: true, index: true })  // Unique and indexed SKU
  sku: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, index: true })  // Index for location-based queries
  location: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Additional indexes
InventorySchema.index({ name: 1 });  // Index for querying by name
InventorySchema.index({ sku: 1 }, { unique: true });  // Ensure SKU is unique and indexed
InventorySchema.index({ location: 1 });  // Index for location-based queries
InventorySchema.index({ sku: 1, location: 1 });  // Compound index for optimized SKU and location-based queries
