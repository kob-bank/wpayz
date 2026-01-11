import { Body, Controller, Post, Logger } from '@nestjs/common';
import { PaymentService } from '../payment/payment.service';
import {
  GenericProviderBalanceReqDto,
  WpayzProviderParams,
} from '@kob-bank/common';

@Controller('balance')
export class BalanceController {
  private readonly logger = new Logger(BalanceController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async getBalance(
    @Body() dto: GenericProviderBalanceReqDto<WpayzProviderParams>,
  ) {
    this.logger.log('Balance request received');
    return await this.paymentService.getBalance(dto);
  }
}
