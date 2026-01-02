import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CallbackStatusEnum } from '../enum/callback-status.enum';

export class WpayzCallbackDto {
  @ApiProperty({ example: 'Deposit' })
  @IsString()
  @IsEnum(['Deposit', 'Withdraw'])
  type: string;

  @ApiProperty({ example: 'success' })
  @IsString()
  @IsEnum(CallbackStatusEnum)
  status: CallbackStatusEnum;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  agentId: number;

  @ApiProperty({ example: '100000' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '04e1e9db-0233bca5-bca390b9-3fc0fb0f' })
  @IsString()
  paymentId: string;

  @ApiProperty({ example: '40c63257-d985-408a-9c0c-c25d9a4f2bda' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 0.13 })
  @IsNumber()
  feeAmount: number;

  @ApiProperty({ example: 9.87 })
  @IsNumber()
  netAmount: number;

  @ApiProperty({ example: '004', required: false })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiProperty({ example: '6292222222', required: false })
  @IsOptional()
  @IsString()
  bankAccountNo?: string;

  @ApiProperty({ example: 'Test Test', required: false })
  @IsOptional()
  @IsString()
  bankAccountName?: string;
}

export default WpayzCallbackDto;
