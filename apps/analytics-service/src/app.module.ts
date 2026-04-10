import { Module } from '@nestjs/common';
import { AnalyticsHandlers } from './analytics/analytics.handlers';

@Module({
  controllers: [AnalyticsHandlers],
})
export class AppModule {}
