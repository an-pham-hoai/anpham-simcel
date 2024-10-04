import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Inventory extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  location: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
