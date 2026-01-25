import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KobLogger } from '@kob-bank/logger';
import axios from 'axios';
import { sub } from 'date-fns';
import { SignJWT } from 'jose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

import { WpayzPaymentRequestInterface } from './interface/wpayz-payment-request.interface';
import {
  WpayzPaymentResponseInterface,
  WpayzPaymentResponseDataInterface,
} from './interface/wpayz-payment-response.interface';

import { BoCallbackService } from '@kob-bank/common/bo-callback';

import WpayzCallbackDto from './dto/wpayz-callback.dto';
import { DepositTypeEnum } from './enum/deposit-type.enum';
import { CallbackStatusEnum } from './enum/callback-status.enum';
import {
  ApiResponseDto,
  WpayzProviderParams,
  DepositStatusEnum,
  GenericProviderBalanceReqDto,
  GenericProviderDepositReqDto,
  GenericProviderDepositRespDto,
  PaymentMethodEnum,
  BankCode,
  mapBankTag2UniformBankTag,
} from '@kob-bank/common';
import {
  UpstreamErrorException,
  ProviderRejectedException,
} from '@kob-bank/common/exceptions';
import { Deposit } from '../deposit/deposit.schema';
import {
  DepositRepository,
  UpdatePaymentInterface,
} from '@kob-bank/common/deposit';
import { QrExtractorService } from '../wpayz/qr-extractor.service';

@Injectable()
export class PaymentService {
  private logger = new KobLogger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly depositRepository: DepositRepository,
    private readonly boCallbackService: BoCallbackService,
    private readonly qrExtractorService: QrExtractorService,
  ) {}

  async requestPayment(
    dto: GenericProviderDepositReqDto<WpayzProviderParams>,
  ): Promise<ApiResponseDto<GenericProviderDepositRespDto>> {
    try {
      const tx = await this.depositRepository.create({
        merchantId: dto.params.agentId,
        agentId: dto.params.agentId,
        site: dto.params.site,
        customerId: dto.username,
        amount: dto.amount,
        callback: dto.params.callbackURL,
        gatewayId: dto.params.gatewayId,
        paymentMethods: PaymentMethodEnum.QR,
      });

      const payload: WpayzPaymentRequestInterface = {
        amount: dto.amount,
        redirectUrl: dto.params.resultURL,
        accountNo: dto.accountNo,
        accountName: dto.fullName,
        bankCode: BankCode[mapBankTag2UniformBankTag(dto.accountBankCode.toLowerCase())],
      };

      const jwt = await new SignJWT({
        agentId: String(dto.params.agentId),
        userId: String(dto.username),
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(dto.params.secretKey));

      const host = this.configService.get('apiHost');
      Logger.debug(`requestPayment: ${host}/api/wpayz/qrcode`);

      const resp = await axios.post<WpayzPaymentResponseInterface>(
        `${host}/api/wpayz/qrcode`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: jwt,
          },
        },
      );

      const data: WpayzPaymentResponseDataInterface = resp.data.data;

      if (resp.data.statusCode !== 200) {
        await this.depositRepository.paymentCreateFailed(tx._id, {
          errorCode: String(resp.data.statusCode),
          errorMessage: resp.data.data?.message || 'Payment creation failed',
        });

        throw new ProviderRejectedException(
          resp.data.data?.message || 'Payment creation failed',
          resp.data.data?.message || 'Payment creation failed',
        );
      }

      // Extract QR code from payUrl (WPayz returns a payment page URL, not QR data)
      let qrCode = '';
      if (data.payUrl) {
        this.logger.debug(`Extracting QR from payUrl: ${data.payUrl}`);
        try {
          qrCode = await this.qrExtractorService.extractQrFromPayUrl(
            data.payUrl,
          );
          this.logger.debug(
            `Successfully extracted QR code (${qrCode.length} chars)`,
          );
        } catch (error) {
          this.logger.error(`Failed to extract QR: ${error.message}`);
          // Fall back to payUrl if extraction fails
          qrCode = data.payUrl;
        }
      }

      // QR code expires in 15 minutes by default
      const expiredAt = dayjs().add(15, 'minutes').tz('Asia/Bangkok').toDate();

      const updatedTx = await this.depositRepository.paymentCreated(tx._id, {
        payee: dto.fullName,
        payAmount: data.payUrl ? dto.amount : data.amount,
        qrCode: qrCode,
        systemRef: data.paymentId,
        systemOrderNo: data.transactionId,
        fee: dto.fee || 0,
        expiredAt: expiredAt,
      });

      return {
        status: true,
        data: {
          id: tx._id.toString(),
          merchantRef: data.transactionId,
          systemRef: data.paymentId,
          payee: dto.fullName,
          payAmount: dto.amount,
          qrCode: qrCode,
          expiredDate: sub(expiredAt, { minutes: 1 }).toISOString(),
        },
      };
    } catch (e) {
      console.error(e);
      if (e instanceof ProviderRejectedException) {
        throw e;
      }
      const message =
        e?.response?.data?.message || e?.message || 'Unknown error';
      throw new UpstreamErrorException(message, message);
    }
  }

  async callback(req: WpayzCallbackDto) {
    const tx = await this.depositRepository.findOneBySystemRef(req.paymentId);
    if (!tx) {
      throw new NotFoundException();
    }

    if (tx.status === DepositStatusEnum.PENDING) {
      const successedAt =
        sub(new Date(), { minutes: 30 }).getTime() > tx.createdAt.getTime()
          ? tx.createdAt
          : new Date();

      const updatePayment: UpdatePaymentInterface = {
        successedAt: successedAt,
        status:
          req.status === CallbackStatusEnum.SUCCESSED
            ? DepositStatusEnum.SUCCESSED
            : DepositStatusEnum.FAILED,
        creditAmount: req.netAmount || req.amount,
        fee: req.feeAmount,
        paymentStatus: req.status,
      };
      await this.depositRepository.updatePayment(tx._id, updatePayment);
    } else {
      this.logger.debug(
        'callback ' + req.transactionId + ' update on non pending tx',
      );
    }
    if (req.status === CallbackStatusEnum.SUCCESSED) {
      await this.boCallbackService.depositCallback(tx._id, {
        isAuto: true,
        isFee: false,
      });
    }
  }

  async getBalance(dto: GenericProviderBalanceReqDto<WpayzProviderParams>) {
    const jwt = await new SignJWT({
      agentId: String(dto.params.agentId),
      userId: '',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(dto.params.secretKey));

    const host = this.configService.get('apiHost');
    const resp = await axios.get(`${host}/api/wpayz/balance`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: jwt,
      },
    });

    const data = resp.data.data;

    return {
      status: true,
      data: {
        depositBalance: data?.balance || 0,
        withdrawBalance: data?.balance || 0,
        withdrawPending: 0,
      },
    };
  }

  async checkOrderStatus(id: string) {
    const t: Deposit =
      await this.depositRepository.findOneBySystemOrderNo(id);

    if (t == null || t.status == DepositStatusEnum.FAILED) {
      throw new NotFoundException();
    }

    return {
      customerId: t.customerId,
      status: t.status,
      amount: t.amount,
    };
  }
}
