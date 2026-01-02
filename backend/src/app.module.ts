import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { PaymentModule } from './payment/payment.module';
import { WithdrawModule } from './withdraw/withdraw.module';
import { DepositModule } from './deposit/deposit.module';
import { HealthModule } from './health/health.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    PaymentModule,
    WithdrawModule,
    DepositModule,
    HealthModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
