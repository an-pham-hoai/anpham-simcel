import { Controller, Get, Post, Put, Delete, Param, Body, Query, Version, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './schemas/inventory.schema';
import { WrapperResponse } from '../common/wrapper-response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)  // Protect all routes
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Version 1 of the API
  // Version 1 (/v1/inventory) will use findAllV1()
  // GET http://localhost:3000/v1/inventory?page=1&size=10
  @Version('1')
  @Get()
  async findAllV1(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
  ): Promise<WrapperResponse<any>> {
    return this.inventoryService.findAll(page, size);
  }

  // Version 2 of the API
  // Version 2 (/v2/inventory) will use findAllV2()
  // GET http://localhost:3000/v2/inventory?page=1&size=10
  @Version('2')
  @Get()
  async findAllV2(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
  ): Promise<any> {
    const response = await this.inventoryService.findAll(page, size);
    // Modify the response structure in v2, for example.
    return {
      ...response,
      meta: {
        page,
        size,
        totalItems: response.data?.total,
      },
    };
  }

  // Version 1 of findOne API
  // Version 1 (/v1/inventory) will use findOneV1()
  // GET http://localhost:3000/v1/inventory/12345
  @Version('1')
  @Get(':sku')
  async findOneV1(@Param('sku') sku: string): Promise<WrapperResponse<Inventory>> {
    return this.inventoryService.findOne(sku);
  }

  // Version 2 of findOne API
  // Version 2 (/v2/inventory) will use findOneV2()
  // GET http://localhost:3000/v2/inventory/12345
  @Version('2')
  @Get(':sku')
  async findOneV2(@Param('sku') sku: string): Promise<WrapperResponse<Inventory>> {
    const item = await this.inventoryService.findOne(sku);
    // Custom logic for version 2 can go here
    return item;
  }

  @Post()
  async create(@Body() item: Inventory): Promise<WrapperResponse<Inventory>> {
    return this.inventoryService.create(item);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() item: Partial<Inventory>,
  ): Promise<WrapperResponse<Inventory>> {
    return this.inventoryService.update(id, item);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<WrapperResponse<null>> {
    return this.inventoryService.delete(id);
  }
}
