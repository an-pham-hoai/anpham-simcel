import { OrderItemDto } from "./order-item-dto";

export class CreateOrderDto {
    orderNumber?: string;
    customerName?: string;
    items: OrderItemDto[] = [];
}