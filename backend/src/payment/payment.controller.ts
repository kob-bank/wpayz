import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import WpayzCallbackDto from './dto/wpayz-callback.dto';
import {
  WpayzProviderParams,
  ApiResponseDto,
  GenericProviderBalanceReqDto,
  GenericProviderDepositReqDto,
  GenericProviderDepositRespDto,
} from '@kob-bank/common';

@ApiTags('Payment')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  @ApiOperation({ summary: 'Request payment (create deposit QR)' })
  async requestPayment(
    @Body() dto: GenericProviderDepositReqDto<WpayzProviderParams>,
  ): Promise<ApiResponseDto<GenericProviderDepositRespDto>> {
    return await this.paymentService.requestPayment(dto);
  }

  @Post('balance')
  @ApiOperation({ summary: 'Check balance' })
  async balance(
    @Body() dto: GenericProviderBalanceReqDto<WpayzProviderParams>,
  ) {
    return await this.paymentService.getBalance(dto);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Callback from WPayz' })
  async callback(@Body() dto: WpayzCallbackDto) {
    return this.paymentService.callback(dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check payment status' })
  async checkStatus(@Query('id') id: string) {
    return this.paymentService.checkOrderStatus(id);
  }
}
