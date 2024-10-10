import { Controller, Get, Version } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Version('1')
  @Get('inventory')
  getInventoryReport() {
    return this.reportService.getInventoryReport();
  }

  @Version('1')
  @Get('sales')
  getSalesReport() {
    return this.reportService.getSalesReport();
  }
}
