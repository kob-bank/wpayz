import { IsOptional, IsString } from 'class-validator';
import {
  GenericProviderDepositReqDto,
  WpayzProviderParams,
} from '@kob-bank/common';

/**
 * Extended DTO to support both payment-ui and kob-payment-gateway request formats
 * 
 * Handles two cases:
 * 1. Direct from payment-ui: params.site is populated
 * 2. From kob-payment-gateway (old versions): site might be at root level
 */
export class WpayzPaymentReqDto extends GenericProviderDepositReqDto<WpayzProviderParams> {
  /**
   * Optional site field at root level for backward compatibility
   * with old kob-payment-gateway versions that send site outside params
   */
  @IsOptional()
  @IsString()
  site?: string;
}
