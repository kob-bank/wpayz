import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';

@Injectable()
export class QrExtractorService implements OnModuleDestroy {
  private readonly logger = new Logger(QrExtractorService.name);
  private browser: Browser | null = null;

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.logger.debug('Launching headless browser...');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Extract QR code from WPayz payment page
   * @param payUrl - The payment URL from WPayz API
   * @returns Base64 encoded QR code image (data:image/png;base64,...)
   */
  async extractQrFromPayUrl(payUrl: string): Promise<string> {
    const browser = await this.getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      this.logger.debug(`Navigating to payUrl: ${payUrl}`);
      await page.goto(payUrl, { waitUntil: 'networkidle' });

      // Wait for canvas element to be present and rendered
      await page.waitForSelector('canvas', { timeout: 10000 });

      // Wait a bit more for canvas to be fully rendered
      await page.waitForTimeout(1000);

      // Extract QR code from canvas as base64
      const qrBase64 = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
          return canvas.toDataURL('image/png');
        }
        return null;
      });

      if (!qrBase64) {
        throw new Error('Failed to extract QR code from canvas');
      }

      this.logger.debug(`Successfully extracted QR code (${qrBase64.length} chars)`);
      return qrBase64;
    } catch (error) {
      this.logger.error(`Failed to extract QR from ${payUrl}: ${error.message}`);
      throw error;
    } finally {
      await context.close();
    }
  }
}
