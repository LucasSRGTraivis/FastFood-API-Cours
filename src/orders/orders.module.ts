import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersController } from './orders.controller';

const ORDERS_CLIENT = 'ORDERS_CLIENT';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDERS_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ||
              'amqp://nexuseats:secret@localhost:5672',
          ],
          queue: 'orders_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
