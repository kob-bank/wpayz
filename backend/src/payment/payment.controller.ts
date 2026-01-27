import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  WpayzProviderParams,
  ApiResponseDto,
  GenericProviderBalanceReqDto,
  GenericProviderDepositReqDto,
  GenericProviderDepositRespDto,
} from '@kob-bank/common';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  async requestPayment(
    @Body() dto: GenericProviderDepositReqDto<WpayzProviderParams>,
  ): Promise<ApiResponseDto<GenericProviderDepositRespDto>> {
    return await this.paymentService.requestPayment(dto);
  }

  @Post('balance')
  async balance(
    @Body() dto: GenericProviderBalanceReqDto<WpayzProviderParams>,
  ) {
    return await this.paymentService.getBalance(dto);
  }

  @Get('status')
  async checkStatus(@Query('id') id: string) {
    return this.paymentService.checkOrderStatus(id);
  }
}
