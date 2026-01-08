import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Deposit as DefaultDeposit } from '@kob-bank/common/deposit';

@Schema({ collection: 'transactions', timestamps: true })
export class Deposit extends DefaultDeposit {
  @Prop()
  agentId: string;

  @Prop({ index: true })
  systemOrderNo: string;

  @Prop()
  merchantId: string;
}

export type DepositDocument = Deposit & Document;
export const DepositSchema = SchemaFactory.createForClass(Deposit);
