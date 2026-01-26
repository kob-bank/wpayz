import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { SignJWT } from 'jose';
import { KobLogger } from '@kob-bank/logger';
import { WithdrawStatusEnum } from '@kob-bank/common';

import { Withdraw } from './withdraw.schema';
import { WpayzWithdrawRequestInterface } from './interface/wpayz-withdraw-request.interface';
import { WpayzWithdrawResponseInterface } from './interface/wpayz-withdraw-response.interface';
import WpayzCallbackDto from '../payment/dto/wpayz-callback.dto';
import { CallbackStatusEnum } from '../payment/enum/callback-status.enum';
import WithdrawReqDto from './dto/withdraw.req.dto';
import { WithdrawRepository } from '@kob-bank/common/withdraw';
import { BoCallbackService } from '@kob-bank/common/bo-callback';

@Injectable()
export class WithdrawService {
  private logger = new KobLogger(WithdrawService.name);

  constructor(
    private readonly configService: ConfigService,
    private withdrawRepository: WithdrawRepository,
    private readonly boCallbackService: BoCallbackService,
  ) {}

  getModel() {
    return this.withdrawRepository;
  }

  async create(dto: WithdrawReqDto) {
    const exists = await this.withdrawRepository.getModel().exists({
      site: dto.params.site,
      transactionId: dto.transactionId,
    });
    if (exists) {
      throw new BadRequestException(
        `transaction ${dto.params.site}/${dto.transactionId} already exists`,
      );
    }
    const withdraw = await this.withdrawRepository.create({
      site: dto.params.site,
      transactionId: dto.transactionId,
      agentId: dto.params.agentId,
      gatewayId: dto.params.gatewayId,
      customerId: dto.customerId,
      bankCode: dto.bankTag,
      bankAccountNo: dto.bankAccountNo,
      bankAccountName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      amount: dto.amount,
      fee: dto.fee || 0,
      callback: dto.callback,
    });

    let resp: AxiosResponse<WpayzWithdrawResponseInterface, any>;
    try {
      // Construct callback URL from HOST (like paydiwa pattern)
      const callbackHost = this.configService.get('host');
      const payload: WpayzWithdrawRequestInterface = {
        toAccountNo: withdraw.bankAccountNo,
        toAccountName: withdraw.bankAccountName,
        toBankCode: withdraw.bankCode,
        amount: withdraw.amount,
        callbackUrl: `https://${callbackHost}/callback`,
      };

      const jwt = await new SignJWT({
        agentId: String(dto.params.agentId),
        userId: String(dto.customerId),
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(dto.params.secretKey));

      const apiHost = this.configService.get('apiHost');
      resp = await axios.post<WpayzWithdrawResponseInterface>(
        `${apiHost}/api/wpayz/withdraw`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: jwt,
          },
        },
      );
    } catch (err) {
      this.logger.error(JSON.stringify(err));
      if (err instanceof AxiosError) {
        if (err.code === 'ERR_BAD_REQUEST') {
          throw new BadRequestException(err?.response?.data.message);
        } else {
          throw new BadGatewayException(err?.response?.data.message);
        }
      }
    }

    if (resp.data.statusCode !== 200) {
      await this.withdrawRepository.withdratCreateFailed(withdraw._id, {
        errorMessage: resp.data.data?.message || 'Withdraw creation failed',
      });
      throw new InternalServerErrorException(
        resp.data.data?.message || 'Withdraw creation failed',
      );
    }

    const params = resp.data?.data;
    await this.withdrawRepository.withrawCreated(withdraw._id, {
      status: WithdrawStatusEnum.PENDING,
      systemRef: params?.paymentId,
      systemOrderNo: params?.transactionId,
      payAmount: params?.amount || withdraw.amount,
      fee: dto.fee || 0,
    });
    return {
      withdrawId: withdraw._id.toString(),
      transactionId: dto.transactionId,
      fee: dto.fee || 0,
    };
  }

  async callback(dto: WpayzCallbackDto) {
    this.logger.debug('callback', JSON.stringify(dto));
    const withdraw = await this.withdrawRepository
      .getModel()
      .findOne({
        systemOrderNo: dto.transactionId,
      })
      .exec();
    if (!withdraw || withdraw.status !== WithdrawStatusEnum.PENDING) {
      throw new BadRequestException(
        `withdraw (payment) id ${dto.paymentId} not found`,
      );
    }
    const status =
      dto.status === CallbackStatusEnum.SUCCESSED
        ? WithdrawStatusEnum.SUCCESSED
        : WithdrawStatusEnum.FAILED;

    const updated = await this.withdrawRepository.updateWithdraw(
      withdraw._id,
      {
        fee: dto.feeAmount,
        callbackPayload: dto,
        completedAt: new Date(),
        status,
      },
    );
    if (updated.callback) {
      await this.boCallbackService.withdrawCallback(updated._id);
    }
  }

  async findOneBySystemOrderNo(systemOrderNo: string): Promise<Withdraw> {
    return this.withdrawRepository
      .getModel()
      .findOne({ systemOrderNo })
      .exec();
  }

  async checkOrderStatus(site: string, id: string) {
    return await this.withdrawRepository.getOneBySiteAndTransactionId(
      site,
      id,
    );
  }
}
