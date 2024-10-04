import { Controller, Get } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('inventory')
  getInventoryReport() {
    return this.reportService.getInventoryReport();
  }

  @Get('sales')
  getSalesReport() {
    return this.reportService.getSalesReport();
  }
}
