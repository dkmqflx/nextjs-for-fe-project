import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 수동으로에러 던진다, /debug-sentry 경로로 접근하면 에러가 발생하고, 이 에러는 Sentry에 자동으로 수집된다.
  @Get('/debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }
}
