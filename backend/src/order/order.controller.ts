import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Version } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // Assuming the API is protected by JWT
import { Order } from './schemas/order.schema';
import { WrapperResponse } from 'src/common/wrapper-response';

@Controller('orders')
@UseGuards(JwtAuthGuard)  // Protect the entire controller with JWT guard
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Version('1')  // API versioning for POST /v1/orders
  async createOrder(@Body() orderDto: any): Promise<WrapperResponse<Order>> {
    return this.orderService.createOrder(orderDto);
  }

  @Get(':orderId')
  @Version('1')  // API versioning for GET /v1/orders/:orderId
  async getOrder(@Param('orderId') orderId: string): Promise<WrapperResponse<Order>> {
    return this.orderService.findOne(orderId);
  }

  @Get()
  @Version('1')  // API versioning for GET /v1/orders
  async getAllOrders(): Promise<WrapperResponse<Order[]>> {
    return this.orderService.getAllOrders();
  }

  @Put(':orderId')
  @Version('1')  // API versioning for PUT /v1/orders/:orderId
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() updateDto: any,
  ): Promise<WrapperResponse<Order>> {
    return this.orderService.updateOrder(orderId, updateDto);
  }

  @Delete(':orderId')
  @Version('1')  // API versioning for DELETE /v1/orders/:orderId
  async deleteOrder(@Param('orderId') orderId: string): Promise<WrapperResponse<null>> {
    return this.orderService.deleteOrder(orderId);
  }
}
