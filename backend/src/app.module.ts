import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ProviderEnum } from '@kob-bank/common';
import {
  BoCallbackModule,
  BoCallbackService,
} from '@kob-bank/common/bo-callback';

import {
  TransactionModule as KobTransactionModule,
  TransactionService,
} from '@kob-bank/common/transaction';

import { AppController } from './app.controller';
import configuration from './config/configuration';
import { PaymentModule } from './payment/payment.module';
import { ReportModule } from './report/report.module';
import { WithdrawModule } from './withdraw/withdraw.module';
import { HealthModule } from './health/health.module';
import { Model } from 'mongoose';
import {
  DefaultDepositLogDocument,
  DefaultDepositLogSchema,
  DepositLog,
  DepositRepository,
  DepositModule as KobDepositModule,
} from '@kob-bank/common/deposit';
import {
  WithdrawRepository,
  WithdrawModule as KobWithdrawModule,
} from '@kob-bank/common/withdraw';
import {
  DepositDocument,
  Deposit,
  DepositSchema,
} from './deposit/deposit.schema';
import { Withdraw, WithdrawSchema } from './withdraw/withdraw.schema';

import { CommonModule as KobCommonModule } from '@kob-bank/common/common';
import { QueueModule } from '@kob-bank/common/queue';

const PROVIDER = ProviderEnum.WPAYZ;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    QueueModule.forRoot({
      provider: PROVIDER,
      redisUrlConfigKey: 'redis_queue',
    }),
    KobTransactionModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          logger: new Logger(TransactionService.name),
          redisURI: configService.get<string>('redis'),
          appName: PROVIDER,
        };
      },
      inject: [ConfigService],
    }),
    KobDepositModule.forRootAsync({
      imports: [
        MongooseModule.forFeature([
          {
            name: Deposit.name,
            schema: DepositSchema,
          },
          {
            name: DepositLog.name,
            schema: DefaultDepositLogSchema,
          },
        ]),
        KobTransactionModule,
      ],
      useFactory: (
        depositModel: Model<DepositDocument>,
        depositLogModel: Model<DefaultDepositLogDocument>,
        configService: ConfigService,
      ) => {
        return {
          logger: new Logger(DepositRepository.name),
          provider: PROVIDER,
          depositModel,
          depositLogModel,
        };
      },
      inject: [
        getModelToken(Deposit.name),
        getModelToken(DepositLog.name),
        TransactionService,
        ConfigService,
      ],
    }),
    KobWithdrawModule.forRootAsync({
      imports: [
        MongooseModule.forFeature([
          {
            name: Withdraw.name,
            schema: WithdrawSchema,
          },
        ]),
        KobTransactionModule,
      ],
      useFactory: (
        withdrawModel: Model<Withdraw>,
        configService: ConfigService,
      ) => {
        return {
          logger: new Logger(WithdrawRepository.name),
          provider: PROVIDER,
          withdrawModel,
        };
      },
      inject: [getModelToken(Withdraw.name), TransactionService],
    }),
    PaymentModule,
    WithdrawModule,
    ReportModule,
    BoCallbackModule.forRootAsync({
      imports: [KobDepositModule, KobWithdrawModule],
      useFactory: (
        depositRepository: DepositRepository,
        withdrawRepository: WithdrawRepository,
      ) => {
        return {
          logger: new Logger(BoCallbackService.name),
          provider: PROVIDER,
          depositModel: depositRepository.getModel() as any,
          withdrawModel: withdrawRepository.getModel() as any,
          batch: {
            enabled: true,
            deposit: {
              flag: {
                isAuto: true,
                isFee: false,
              },
            },
          },
          retry: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 5000, // 5 seconds initial delay
            },
          },
        };
      },
      inject: [DepositRepository, WithdrawRepository],
    }),
    KobCommonModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          logger: new Logger('KobCommonModule'),
          redisURI: configService.get<string>('redis'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
