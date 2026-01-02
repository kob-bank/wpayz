import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WpayzProviderParams } from '@kob-bank/common';

export class WithdrawReqDto {
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
