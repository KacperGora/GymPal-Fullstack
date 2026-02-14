import { Module, Global } from '@nestjs/common';
import { CustomLoggerService } from '../logger/logger.service';

@Global()
@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class SentryModule {}
