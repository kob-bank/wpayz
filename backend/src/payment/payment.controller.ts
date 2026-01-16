import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import WpayzCallbackDto from './dto/wpayz-callback.dto';
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

  @Post('callback')
  async callback(@Body() dto: WpayzCallbackDto) {
    return this.paymentService.callback(dto);
  }

  @Get('status')
  async checkStatus(@Query('id') id: string) {
    return this.paymentService.checkOrderStatus(id);
  }
}
