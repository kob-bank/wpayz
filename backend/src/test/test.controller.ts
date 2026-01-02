import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Test')
@Controller('test')
export class TestController {
  @Get()
  @ApiOperation({ summary: 'Test endpoint' })
  test() {
    return {
      message: 'WPayz gateway is working',
      timestamp: new Date().toISOString(),
    };
  }
}
