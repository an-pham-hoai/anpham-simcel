import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';  // Import mongoose for ObjectId
import { Inventory } from '../../inventory/schemas/inventory.schema';

@Schema({ timestamps: true })  // Enable timestamps
export class Order extends Document {
  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true })
  customerName: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }])  
  items: Inventory[];

  @Prop({ required: true })
  totalQuantity: number;

  @Prop({ default: Date.now })
  orderDate: Date;

  @Prop({ default: 'pending' })
  status: string;  // e.g., 'pending', 'fulfilled'
}

export const OrderSchema = SchemaFactory.createForClass(Order);
