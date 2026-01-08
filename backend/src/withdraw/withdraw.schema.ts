import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Withdraw as DefaultWithdraw } from '@kob-bank/common/withdraw';

@Schema({ collection: 'withdraws', timestamps: true })
export class Withdraw extends DefaultWithdraw {
  @Prop({ index: true })
  systemOrderNo: string;
}

export type WithdrawDocument = Withdraw & Document;
export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
WithdrawSchema.index({ site: 1, transactionId: 1 }, { unique: true });
