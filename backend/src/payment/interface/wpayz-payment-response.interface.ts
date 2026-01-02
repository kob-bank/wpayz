export interface WpayzPaymentResponseDataInterface {
  paymentId: string;
  payUrl: string;
  transactionId: string;
}

export interface WpayzPaymentResponseInterface {
  statusCode: number;
  data: WpayzPaymentResponseDataInterface;
}
