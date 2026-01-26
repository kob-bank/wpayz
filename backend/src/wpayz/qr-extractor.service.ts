import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class QrExtractorService {
  private readonly logger = new Logger(QrExtractorService.name);

  // trustsig API base URL (from WPayz frontend config)
  private readonly TRUSTSIG_API_URL = 'https://mainnet.trustsig.xyz/v1';

  /**
   * Extract QR code from WPayz payment page by calling trustsig API directly
   * @param payUrl - The payment URL from WPayz API (e.g., https://nova777881.xyz/pay/{paymentId})
   * @returns PromptPay QR code string (e.g., "00020101021129370016A000000677010111...")
   */
  async extractQrFromPayUrl(payUrl: string): Promise<string> {
    try {
      // Extract paymentId from payUrl
      // Format: https://nova777881.xyz/pay/{paymentId} or https://alpha777881.xyz/pay/{paymentId}
      const urlObj = new URL(payUrl);
      const pathParts = urlObj.pathname.split('/');
      const paymentId = pathParts[pathParts.length - 1];

      if (!paymentId) {
        throw new Error(`Could not extract paymentId from payUrl: ${payUrl}`);
      }

      this.logger.debug(`Extracting QR for paymentId: ${paymentId}`);

      // Call trustsig API to get payment details including QR code
      const response = await axios.get(
        `${this.TRUSTSIG_API_URL}/payment/${paymentId}`,
        {
          timeout: 10000,
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.error || 'Failed to get payment details from trustsig',
        );
      }

      // Extract QR code from response
      // Expected response format: { success: true, data: { qrCode: "000201...", ... } }
      const qrCode =
        response.data?.data?.qrCode ||
        response.data?.data?.qr_code ||
        response.data?.data?.promptpayQR ||
        response.data?.data?.originCode;

      if (!qrCode) {
        this.logger.warn(
          `QR code not found in trustsig response, available fields: ${Object.keys(response.data?.data || {}).join(', ')}`,
        );
        throw new Error('QR code not found in trustsig API response');
      }

      this.logger.debug(
        `Successfully extracted QR code (${qrCode.length} chars)`,
      );
      return qrCode;
    } catch (error) {
      this.logger.error(`Failed to extract QR from ${payUrl}: ${error.message}`);
      throw error;
    }
  }
}
