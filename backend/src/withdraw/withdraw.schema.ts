import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WithdrawDocument = Withdraw & Document;

@Schema({ timestamps: true })
export class Withdraw {
  @Prop({ required: true })
  site: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  agentId: string;

  @Prop()
  gatewayId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  bankCode: string;

  @Prop({ required: true })
  bankAccountNo: string;

  @Prop({ required: true })
  bankAccountName: string;

  @Prop()
  phoneNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  fee: number;

  @Prop({ default: 0 })
  payAmount: number;

  @Prop()
  systemRef: string;

  @Prop()
  systemOrderNo: string;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop()
  callback: string;

  @Prop()
  callbackPayload: any;

  @Prop()
  completedAt: Date;

  @Prop()
  errorCode: string;

  @Prop()
  errorMessage: string;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
