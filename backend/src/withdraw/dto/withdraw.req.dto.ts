import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WpayzProviderParams, GenericProviderCryptoWithdrawReqDto } from '@kob-bank/common';

export default class WithdrawReqDto {
  @ApiProperty()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty()
  @IsString()
  bankTag: string;

  @ApiProperty()
  @IsString()
  bankAccountNo: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fee?: number;

  @ApiProperty()
  params: WpayzProviderParams;

  @ApiProperty({ required: false })
  @IsOptional()
  callback?: string;
}

export class CryptoWithdrawRequestDto extends GenericProviderCryptoWithdrawReqDto<WpayzProviderParams> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  agentUser: string;
}

export class WithdrawResponseData {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class CryptoWithdrawResponseDto {
  @IsNumber()
  @IsNotEmpty()
  statusCode: number;

  @IsOptional()
  data?: WithdrawResponseData;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsString()
  @IsOptional()
  responseMessage?: string;
}
