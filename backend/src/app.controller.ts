import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import WpayzCallbackDto from './payment/dto/wpayz-callback.dto';
import { PaymentService } from './payment/payment.service';
import { WithdrawService } from './withdraw/withdraw.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly withdrawService: WithdrawService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  getHello(): string {
    return 'WPayz Payment Gateway is running';
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback health check' })
  async callbackCheck() {
    return 'OK';
  }

  @Post('callback')
  @ApiOperation({ summary: 'Unified callback from WPayz' })
  async callback(@Body() dto: WpayzCallbackDto) {
    try {
      const isDeposit = dto.type === 'Deposit';
      const isWithdraw = dto.type === 'Withdraw';

      if (!isDeposit && !isWithdraw) {
        throw new HttpException(
          `Invalid type: ${dto.type}. Expected 'Deposit' or 'Withdraw'`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (isDeposit) {
        await this.paymentService.callback(dto);
      } else {
        await this.withdrawService.callback(dto);
      }

      return {
        status: true,
        message: 'Success',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        e.message,
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
