import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Inventory } from "src/inventory/schemas/inventory.schema";

@Schema({ timestamps: true })  // Enable timestamps 
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: Inventory.name, required: true })
    inventoryId: Types.ObjectId; // Reference to Inventory item

    @Prop({ required: true })
    sku: string;

    @Prop({ required: true })
    quantity: number; 
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
