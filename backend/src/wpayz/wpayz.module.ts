import { Module } from '@nestjs/common';
import { QrExtractorService } from './qr-extractor.service';

@Module({
  providers: [QrExtractorService],
  exports: [QrExtractorService],
})
export class WpayzModule {}
