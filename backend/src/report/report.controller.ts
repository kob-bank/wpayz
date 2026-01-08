import { ProviderReportRespDto } from '@kob-bank/common';
import {
  ReportController as KobReportController,
  TimeDifferencePresetEnum,
} from '@kob-bank/common/report';
import { ReportService } from './report.service';
import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('report')
export class ReportController extends KobReportController {
  constructor(reportService: ReportService) {
    super(reportService);
  }

  @Get(':site/:type')
  async report(
    @Param('site') site: string,
    @Param('type') type: string,
    @Query('searchKeyword') search: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('offset') offset: string,
    @Query('limit') limit: string,
  ): Promise<ProviderReportRespDto> {
    return await this.getAllTransactions(
      site,
      type,
      search,
      from,
      to,
      offset,
      limit,
    );
  }

  @Get(':site/:type/latency')
  async latency(
    @Param('site') site: string,
    @Param('type') type: string,
    @Query('preset') preset: TimeDifferencePresetEnum,
  ) {
    return await this.getTimeDifferenceReport(site, type, preset);
  }
}
