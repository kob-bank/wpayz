import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Withdraw, WithdrawSchema } from './withdraw.schema';
import { ConfigModule } from '@nestjs/config';
import { BoCallbackService } from '@kob-bank/common/bo-callback';
import { WithdrawRepository } from '@kob-bank/common/withdraw';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    MongooseModule.forFeature([
      { name: Withdraw.name, schema: WithdrawSchema },
    ]),
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService, WithdrawRepository, BoCallbackService],
  exports: [WithdrawService],
})
export class WithdrawModule {}
