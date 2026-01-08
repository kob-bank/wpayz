export interface WpayzWithdrawResponseDataInterface {
  paymentId: string;
  fundOutStatus: string;
  message: string;
  transactionId: string;
  amount?: number;
}

export interface WpayzWithdrawResponseInterface {
  statusCode: number;
  data: WpayzWithdrawResponseDataInterface;
}
