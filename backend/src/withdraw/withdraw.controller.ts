import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WithdrawService } from './withdraw.service';
import WithdrawReqDto, {
  CryptoWithdrawRequestDto,
  CryptoWithdrawResponseDto,
} from './dto/withdraw.req.dto';

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

  @Post('crypto')
  @ApiOperation({ summary: 'Create USDT crypto withdrawal' })
  async withdrawCrypto(
    @Body() dto: CryptoWithdrawRequestDto,
  ): Promise<CryptoWithdrawResponseDto> {
    this.logger.log(`Crypto withdraw request received: network=${dto.network}, amount=${dto.amountTHB}`);
    return this.withdrawService.withdrawCrypto(dto);
  }
}
