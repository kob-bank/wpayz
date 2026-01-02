import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Report')
@Controller('report')
export class ReportController {
  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction report' })
  async getTransactions(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // Placeholder for transaction report
    return {
      message: 'Transaction report endpoint',
      startDate,
      endDate,
    };
  }
}
