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
        queue: 'analytics_queue',
        queueOptions: { durable: true },
        exchange: 'order_events',
        exchangeType: 'fanout',
        exchangeOptions: { durable: true },
      },
    },
  );

  await app.listen();

  console.log('[analytics-service] started on queue "analytics_queue"');
}

void bootstrap();
