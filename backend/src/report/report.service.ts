import {
  WpayzProviderParams,
  ProviderDepositTransactionByIdReqDto,
  ProviderDepositTransactionsReqDto,
  ProviderWithdrawTransactionByIdReqDto,
  ProviderWithdrawTransactionsReqDto,
  ProviderDepositReportDto,
  ProviderEnum,
  ProviderWithdrawReportDto,
} from '@kob-bank/common';
import { ReportService as KobReportService } from '@kob-bank/common/report';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format, parseJSON } from 'date-fns';
import * as jose from 'jose';
import { DepositRepository } from '@kob-bank/common/deposit';
import { WithdrawRepository } from '@kob-bank/common/withdraw';
import { Deposit } from '../deposit/deposit.schema';
import { Withdraw, WithdrawDocument } from '../withdraw/withdraw.schema';

@Injectable()
export class ReportService extends KobReportService<Deposit, Withdraw> {
  private readonly DEPOSIT_FEE_PERCENTAGE = 0.015; // 1.5%
  private readonly WITHDRAW_FEE_PERCENTAGE = 0.005; // 0.5%

  constructor(
    private readonly configService: ConfigService,
    private readonly depositRepository: DepositRepository,
    private readonly withdrawRepository: WithdrawRepository,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super(depositRepository.getModel(), withdrawRepository.getModel());
  }

  private calculateDepositFee(amount: number): number {
    return Number((amount * this.DEPOSIT_FEE_PERCENTAGE).toFixed(2));
  }

  private calculateWithdrawFee(amount: number): number {
    return Number((amount * this.WITHDRAW_FEE_PERCENTAGE).toFixed(2));
  }

  mapDepositTransaction(tx: Deposit): ProviderDepositReportDto {
    const calculatedFee = this.calculateDepositFee(tx.amount);

    return {
      id: tx._id.toString(),
      amount: tx.amount,
      provider: ProviderEnum.WPAYZ,
      status: tx.status,
      requestTime: tx.createdAt,
      fee: calculatedFee,
      reference: tx.systemOrderNo,
      customerId: tx.customerId,
      realAmount: tx.payAmount,
      payee: tx.payee,
      paymentTime: tx.successedAt,
      expiredTime: tx.expiredAt,
    };
  }

  mapWithdrawTransaction(tx: WithdrawDocument): ProviderWithdrawReportDto {
    const calculatedFee = this.calculateWithdrawFee(tx.amount);

    return {
      id: tx.systemOrderNo ?? tx._id.toString(),
      amount: tx.amount,
      provider: ProviderEnum.WPAYZ,
      status: tx.status,
      submitStatus: tx.submitStatus,
      requestTime: tx.createdAt,
      fee: calculatedFee,
      transactionId: tx.transactionId,
      bankCode: tx.bankCode,
      bankAccountNo: tx.bankAccountNo,
      bankAccountName: tx.bankAccountName,
      updateTime: tx.completedAt,
      reason: tx.errorMessage,
      gatewayId: tx.gatewayId,
      site: tx.site,
    };
  }

  getWithdrawSearchFields(): string[] {
    return ['merchantRef', 'systemOrderNo', 'customerId'];
  }

  async getDepositTransactionById(
    dto: ProviderDepositTransactionByIdReqDto<WpayzProviderParams>,
  ) {
    let id = dto.id;
    if (id.endsWith('WPZ')) {
      const tx = await this.depositRepository
        .getModel()
        .findOne({ systemOrderNo: id });
      if (tx) {
        id = tx.systemRef;
      }
    }

    const jwt = await new jose.SignJWT({
      agentId: String(dto.params.agentId),
      userId: '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(dto.params.secretKey));

    const host = this.configService.get('apiHost');
    const resp = await axios.get(`${host}/api/wpayz/deposit/transactions/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwt,
      },
    });

    return {
      status: true,
      data: resp.data,
    };
  }

  async getWithdrawTransactionById(
    dto: ProviderWithdrawTransactionByIdReqDto<WpayzProviderParams>,
  ) {
    let id = dto.id;
    if (id.endsWith('WPZ')) {
      const tx = await this.withdrawRepository
        .getModel()
        .findOne({ systemOrderNo: id });
      if (tx) {
        id = tx.systemRef;
      }
    }

    const jwt = await new jose.SignJWT({
      agentId: String(dto.params.agentId),
      userId: '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(dto.params.secretKey));

    const host = this.configService.get('apiHost');
    const resp = await axios.get(`${host}/api/wpayz/withdraw/transactions/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwt,
      },
    });

    return {
      status: true,
      data: resp.data,
    };
  }

  async getDepositTransactions(
    dto: ProviderDepositTransactionsReqDto<WpayzProviderParams>,
  ) {
    const jwt = await new jose.SignJWT({
      agentId: String(dto.params.agentId),
      userId: '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(dto.params.secretKey));

    const query = new URLSearchParams({
      sDate: format(parseJSON(dto.startTime), 'yyyy-MM-dd'),
      eDate: format(parseJSON(dto.endTime), 'yyyy-MM-dd'),
      userId: dto.userId ?? '',
      status: dto.status ?? '',
    });

    const host = this.configService.get('apiHost');
    const resp = await axios.get(
      `${host}/api/wpayz/deposit/transactions?${query.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: jwt,
        },
      },
    );

    return {
      status: true,
      data: resp.data.data,
    };
  }

  async getWithdrawTransactions(
    dto: ProviderWithdrawTransactionsReqDto<WpayzProviderParams>,
  ) {
    const jwt = await new jose.SignJWT({
      agentId: String(dto.params.agentId),
      userId: '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(dto.params.secretKey));

    const query = new URLSearchParams({
      sDate: format(parseJSON(dto.startTime), 'yyyy-MM-dd'),
      eDate: format(parseJSON(dto.endTime), 'yyyy-MM-dd'),
      userId: dto.userId ?? '',
      status: dto.status ?? '',
    });

    const host = this.configService.get('apiHost');
    const resp = await axios.get(
      `${host}/api/wpayz/withdraw/transactions?${query.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: jwt,
        },
      },
    );

    return {
      status: true,
      data: resp.data.data,
    };
  }
}
