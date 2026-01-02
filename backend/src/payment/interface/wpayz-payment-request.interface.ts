export interface WpayzPaymentRequestInterface {
  amount: number;
  accountNo: string;
  accountName: string;
  bankCode: string;
  redirectUrl?: string;
}
