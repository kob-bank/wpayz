import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import WpayzCallbackDto from './dto/wpayz-callback.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
