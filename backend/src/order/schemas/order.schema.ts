import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';  // Import mongoose for ObjectId
import { Inventory } from '../../inventory/schemas/inventory.schema';
import { OrderItem, OrderItemSchema } from './order.item.schema';

@Schema({ timestamps: true })  // Enable timestamps
export class Order extends Document {
  @Prop({ required: true, unique: true, index: true })  // Add unique index for fast lookups
  orderNumber: string;

  @Prop({ required: true, index: true })  // Add index for customer-based queries
  customerName: string;

  /* @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', index: true }])  // Index ObjectId references to Inventory
  items: Inventory[]; */

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[]; // Array of items, each with item and itemQuantity

  @Prop({ required: true })
  totalQuantity: number;

  @Prop({ default: Date.now })
  orderDate: Date;

  @Prop({ default: 'pending', index: true })  // Index for order status filtering
  status: string;  // e.g., 'pending', 'fulfilled'
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Define additional indexes
OrderSchema.index({ orderDate: -1 });  // Index on orderDate for sorting by most recent orders
OrderSchema.index({ customerName: 1, orderDate: -1 });  // Compound index for customer-based queries with sorting
