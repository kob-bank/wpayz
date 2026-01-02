import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DepositDocument = Deposit & Document;

@Schema({ timestamps: true })
export class Deposit {
  @Prop({ required: true })
  merchantId: string;

  @Prop({ required: true })
  agentId: string;

  @Prop({ required: true })
  site: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  fee: number;

  @Prop({ default: 0 })
  payAmount: number;

  @Prop()
  payee: string;

  @Prop()
  qrCode: string;

  @Prop()
  systemRef: string;

  @Prop()
  systemOrderNo: string;

  @Prop()
  paymentStatus: string;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop()
  expiredAt: Date;

  @Prop()
  successedAt: Date;

  @Prop()
  callback: string;

  @Prop()
  callbackPayload: any;

  @Prop()
  gatewayId: string;

  @Prop()
  paymentMethods: string;

  @Prop()
  errorCode: string;

  @Prop()
  errorMessage: string;
}

export const DepositSchema = SchemaFactory.createForClass(Deposit);
