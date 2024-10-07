import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
    @IsNotEmpty()
    @IsString()
    sku: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'Quantity must be at least 1.' })
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Unique order number', example: 'ORD12345' })
    @IsNotEmpty()
    @IsString()
    orderNumber: string;

    @ApiProperty({ description: 'Name of the customer placing the order', example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    customerName: string;

    @ApiProperty({ description: 'List of items in the order', type: [OrderItemDto] })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)  // Tell class-transformer to transform items to OrderItemDto
    items: OrderItemDto[];
}
