import { Controller, Get, Post, Put, Delete, Param, Body, Query, Version, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './schemas/inventory.schema';
import { WrapperResponse } from '../common/wrapper-response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('inventory')
@UseGuards(JwtAuthGuard)  // Protect all routes
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  // Version 1 of the API
  // Version 1 (/v1/inventory) will use findAllV1()
  @Version('1')
  @Get()
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: 'Page size', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order', example: 'asc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query', example: 'laptop' })
  async findAllV1(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('search') search: string = '',
  ): Promise<any> {
    return this.inventoryService.findAll(page, size, sortBy, sortOrder, search);
  }

  // Version 2 of the API
  // Version 2 (/v2/inventory) will use findAllV2()
  @Version('2')
  @Get()
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: 'Page size', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order', example: 'asc' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query', example: 'laptop' })
  async findAllV2(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('search') search: string = '',
  ): Promise<any> {
    const response = await this.inventoryService.findAll(page, size, sortBy, sortOrder, search);
    // Modify the response structure in v2, for example.
    return {
      ...response,
      meta: {
        page,
        size,
        sortBy,
        sortOrder,
        search,
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

  @Version('1')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createInventoryDto: CreateInventoryDto): Promise<WrapperResponse<Inventory>> {
    return this.inventoryService.create(createInventoryDto);
  }

  @Version('1')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<WrapperResponse<Inventory>> {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Version('1')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<WrapperResponse<null>> {
    return this.inventoryService.delete(id);
  }
}
