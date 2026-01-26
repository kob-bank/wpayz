import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class QrExtractorService {
  private readonly logger = new Logger(QrExtractorService.name);

  /**
   * Extract QR code from WPayz payment page by calling internal API
   * @param payUrl - The payment URL from WPayz API (e.g., https://vibe777881.xyz/pay/{paymentId})
   * @returns PromptPay QR code string (e.g., "00020101021129370016A000000677010111...")
   */
  async extractQrFromPayUrl(payUrl: string): Promise<string> {
    try {
      // Extract base URL and paymentId from payUrl
      // Format: https://vibe777881.xyz/pay/{paymentId}
      const urlObj = new URL(payUrl);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      const pathParts = urlObj.pathname.split('/');
      const paymentId = pathParts[pathParts.length - 1];

      if (!paymentId) {
        throw new Error(`Could not extract paymentId from payUrl: ${payUrl}`);
      }

      this.logger.debug(
        `Extracting QR for paymentId: ${paymentId} from ${baseUrl}`,
      );

      // Call internal API to get payment details including QR code
      // API: /api/get-payment-info?invoice_id={paymentId}
      const response = await axios.get(
        `${baseUrl}/api/get-payment-info?invoice_id=${paymentId}`,
        {
          timeout: 10000,
          headers: {
            Accept: '*/*',
            'User-Agent': 'Mozilla/5.0',
            source_id: 'xpays',
            Referer: payUrl,
          },
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.error ||
            'Failed to get payment details from WPayz API',
        );
      }

      // Extract QR code from response
      // Response format: { success: true, data: { payment: { payment_qr: "000201...", payment_qr_base64: "data:image/png;base64,..." } } }
      const payment = response.data?.data?.payment;
      const qrCode = payment?.payment_qr;

      if (!qrCode) {
        this.logger.warn(
          `QR code not found in response, available fields: ${Object.keys(payment || {}).join(', ')}`,
        );
        throw new Error('QR code not found in WPayz API response');
      }

      this.logger.debug(
        `Successfully extracted QR code (${qrCode.length} chars)`,
      );
      return qrCode;
    } catch (error) {
      this.logger.error(
        `Failed to extract QR from ${payUrl}: ${error.message}`,
      );
      throw error;
    }
  }
}
