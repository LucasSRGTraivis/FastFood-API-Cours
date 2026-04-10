import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const amqpUrl =
    process.env.RABBITMQ_URL || 'amqp://nexuseats:secret@localhost:5672';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [amqpUrl],
        queue: 'notifications_queue',
        queueOptions: { durable: true },
        exchange: 'order_events',
        exchangeType: 'fanout',
        exchangeOptions: { durable: true },
      },
    },
  );

  await app.listen();
  // eslint-disable-next-line no-console
  console.log(
    '[notifications-service] started on queue "notifications_queue"',
  );
}

bootstrap();
