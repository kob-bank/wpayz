export interface WpayzPaymentResponseDataInterface {
  paymentId: string;
  payUrl: string;
  transactionId: string;
  amount?: number;
  message?: string;
}

export interface WpayzPaymentResponseInterface {
  statusCode: number;
  data: WpayzPaymentResponseDataInterface;
}
