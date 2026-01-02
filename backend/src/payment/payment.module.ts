import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Deposit, DepositSchema } from '../deposit/deposit.schema';
import { ConfigModule } from '@nestjs/config';
import { BoCallbackService } from '@kob-bank/common/bo-callback';
import { DepositRepository } from '@kob-bank/common/deposit';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    MongooseModule.forFeature([{ name: Deposit.name, schema: DepositSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, DepositRepository, BoCallbackService],
  exports: [PaymentService],
})
export class PaymentModule {}
