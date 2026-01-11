import { Body, Controller, Post, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  GenericProviderDepositReqDto,
  WpayzProviderParams,
} from '@kob-bank/common';

@Controller()
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  async requestPayment(
    @Body() dto: GenericProviderDepositReqDto<WpayzProviderParams>,
  ) {
    this.logger.log(`Payment request received for user: ${dto.username}, amount: ${dto.amount}`);
    return await this.paymentService.requestPayment(dto);
  }
}
