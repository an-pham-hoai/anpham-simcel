import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Version, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // Assuming the API is protected by JWT
import { Order } from './schemas/order.schema';
import { WrapperResponse } from 'src/common/wrapper-response';
import { CreateOrderDto } from './dto/create-order.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('orders')
@UseGuards(JwtAuthGuard)  // Protect the entire controller with JWT guard
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Overrride rate limit setting: allow only 5 requests per 60 seconds for this endpoint (low number for testing)
  @Post()
  @Version('1')
  async createOrder(@Body() orderDto: CreateOrderDto): Promise<WrapperResponse<Order>> {
    return this.orderService.create(orderDto);
  }

  @Get(':orderId')
  @Version('1')  // API versioning for GET /v1/orders/:orderId
  async getOrder(@Param('orderId') orderId: string): Promise<WrapperResponse<Order>> {
    return this.orderService.findOne(orderId);
  }

  // Version 1 of the API
  // Version 1 (/v1/orders) will use findAllV1()
  @Version('1')
  @Get()
  async findAllV1(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('search') search: string = '',
  ): Promise<any> {
    return this.orderService.findAll(page, size, sortBy, sortOrder, search);
  }

  // Version 2 of the API
  // Version 2 (/v2/orders) will use findAllV2()
  @Version('2')
  @Get()
  async findAllV2(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('search') search: string = '',
  ): Promise<any> {
    const response = await this.orderService.findAll(page, size, sortBy, sortOrder, search);
    // Modify the response structure in v2, for example.
    return {
      ...response,
      meta: {
        page,
        size,
        sortBy,
        sortOrder,
        search,
        totalItems: response.total,
      },
    };
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
