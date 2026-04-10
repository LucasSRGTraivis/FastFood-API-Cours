import { Module } from '@nestjs/common';
import { NotificationsHandlers } from './notifications/notifications.handlers';

@Module({
  controllers: [NotificationsHandlers],
})
export class AppModule {}
