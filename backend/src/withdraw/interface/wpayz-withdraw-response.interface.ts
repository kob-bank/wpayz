export interface WpayzWithdrawResponseDataInterface {
  paymentId: string;
  fundOutStatus: string;
  message: string;
  transactionId: string;
}

export interface WpayzWithdrawResponseInterface {
  statusCode: number;
  data: WpayzWithdrawResponseDataInterface;
}
