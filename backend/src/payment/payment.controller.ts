import { Body, Controller, Post, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(PaymentController.name);

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

  @Post('payment')
  async requestPayment(
    @Body() dto: GenericProviderDepositReqDto<WpayzProviderParams>,
  ) {
    this.logger.log(`Payment request received for user: ${dto.username}, amount: ${dto.amount}`);
    return await this.paymentService.requestPayment(dto);
  }
}
