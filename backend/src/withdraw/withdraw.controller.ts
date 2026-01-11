import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WithdrawService } from './withdraw.service';
import WithdrawReqDto from './dto/withdraw.req.dto';

@ApiTags('Withdraw')
@Controller('withdraw')
export class WithdrawController {
  private readonly logger = new Logger(WithdrawController.name);

  constructor(private readonly withdrawService: WithdrawService) {}

  @Post()
  @ApiOperation({ summary: 'Create withdrawal' })
  async create(@Body() dto: WithdrawReqDto) {
    this.logger.log(`Withdraw request received for customer: ${dto.customerId}, amount: ${dto.amount}`);
    return this.withdrawService.create(dto);
  }

  @Get(':site/:transactionId')
  @ApiOperation({ summary: 'Check withdrawal status' })
  async checkStatus(
    @Param('site') site: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.withdrawService.checkOrderStatus(site, transactionId);
  }
}
