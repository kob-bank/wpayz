import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [BalanceController],
})
export class BalanceModule {}
