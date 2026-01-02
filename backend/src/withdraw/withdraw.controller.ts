import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WithdrawService } from './withdraw.service';
import WithdrawReqDto from './dto/withdraw.req.dto';
import WpayzCallbackDto from '../payment/dto/wpayz-callback.dto';

@ApiTags('Withdraw')
@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Post()
  @ApiOperation({ summary: 'Create withdrawal' })
  async create(@Body() dto: WithdrawReqDto) {
    return this.withdrawService.create(dto);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Callback from WPayz' })
  async callback(@Body() dto: WpayzCallbackDto) {
    return this.withdrawService.callback(dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check withdrawal status' })
  async checkStatus(@Query('site') site: string, @Query('id') id: string) {
    return this.withdrawService.checkOrderStatus(site, id);
  }
}
