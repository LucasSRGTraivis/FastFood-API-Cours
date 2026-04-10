import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersHandlers } from './orders/orders.handlers';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EVENTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://nexuseats:secret@localhost:5672',
          ],
          exchange: 'order_events',
          exchangeType: 'fanout',
          exchangeOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [OrdersHandlers],
})
export class AppModule {}
