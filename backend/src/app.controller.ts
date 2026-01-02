import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  healthCheck() {
    return {
      status: 'ok',
      gateway: 'wpayz',
      timestamp: new Date().toISOString(),
    };
  }
}
