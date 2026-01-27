import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KobLogger } from '@kob-bank/logger';
import WpayzCallbackDto from './payment/dto/wpayz-callback.dto';
import { PaymentService } from './payment/payment.service';
import { WithdrawService } from './withdraw/withdraw.service';

@ApiTags('App')
@Controller()
export class AppController {
  private logger = new KobLogger(AppController.name);

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
  @HttpCode(200)
  @ApiOperation({ summary: 'Unified callback from WPayz' })
  async callback(@Body() dto: WpayzCallbackDto) {
    try {
      // Try deposit first, then withdraw (like paydiwa pattern)
      const depositHandled = await this.paymentService.tryCallback(dto);
      if (depositHandled) {
        return { success: true };
      }

      const withdrawHandled = await this.withdrawService.tryCallback(dto);
      if (withdrawHandled) {
        return { success: true };
      }

      // Not found - still return success to stop WPayz from retrying
      this.logger.warn(
        `Callback transaction not found: paymentId=${dto.paymentId} transactionId=${dto.transactionId}`,
      );
      return { success: true };
    } catch (e) {
      this.logger.error(`Callback error: ${e.message}`);
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
