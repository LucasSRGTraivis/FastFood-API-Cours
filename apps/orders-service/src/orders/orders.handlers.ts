import { Controller, Inject } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  RpcException,
  ClientProxy,
} from '@nestjs/microservices';

type OrderItem = { menuItemId: number; qty: number };

type CreateOrderDto = {
  customerId: number;
  items: OrderItem[];
};

type Order = {
  id: string;
  customerId: number;
  items: OrderItem[];
  createdAt: string;
};

@Controller()
export class OrdersHandlers {
  private orders: Order[] = [];

  constructor(@Inject('EVENTS_CLIENT') private readonly eventsClient: ClientProxy) {}

  private createOrderImpl(dto: CreateOrderDto): Order {
    const order: Order = {
      id: globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}`,
      customerId: dto.customerId,
      items: dto.items,
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);

    // Fire & forget — ne bloque pas la réponse
    this.eventsClient.emit('order.created', {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items,
      timestamp: order.createdAt,
    });

    return order;
  }

  @MessagePattern('create_order')
  async createOrderString(@Payload() dto: CreateOrderDto): Promise<Order> {
    console.log('[orders-service] received create_order (string)', dto);
    const order = this.createOrderImpl(dto);
    console.log('[orders-service] created order', order.id);
    return order;
  }

  @MessagePattern({ cmd: 'create_order' })
  async createOrderObject(@Payload() dto: CreateOrderDto): Promise<Order> {
    console.log('[orders-service] received create_order (object)', dto);
    const order = this.createOrderImpl(dto);
    console.log('[orders-service] created order', order.id);
    return order;
  }

  @MessagePattern('get_orders')
  async getOrdersString(): Promise<Order[]> {
    console.log('[orders-service] received get_orders (string)');
    return this.orders;
  }

  @MessagePattern({ cmd: 'get_orders' })
  async getOrdersObject(): Promise<Order[]> {
    console.log('[orders-service] received get_orders (object)');
    return this.orders;
  }

  private getOrderByIdImpl(id: string): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new RpcException({ statusCode: 404, message: 'Order introuvable' });
    }
    return order;
  }

  @MessagePattern('get_order_by_id')
  async getOrderByIdString(
    @Payload() data: { id: string },
  ): Promise<Order> {
    console.log('[orders-service] received get_order_by_id (string)', data.id);
    return this.getOrderByIdImpl(data.id);
  }

  @MessagePattern({ cmd: 'get_order_by_id' })
  async getOrderByIdObject(
    @Payload() data: { id: string },
  ): Promise<Order> {
    console.log(
      '[orders-service] received get_order_by_id (object)',
      data.id,
    );
    return this.getOrderByIdImpl(data.id);
  }
}

