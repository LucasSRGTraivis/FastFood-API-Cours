import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AnalyticsHandlers {
  private asRecord(data: unknown): Record<string, unknown> {
    return typeof data === 'object' && data !== null
      ? (data as Record<string, unknown>)
      : {};
  }

  @EventPattern('order.created')
  handleOrderCreated(@Payload() data: unknown) {
    const payload = this.asRecord(data);
    const itemsCount = Array.isArray(payload.items) ? payload.items.length : 0;

    console.log(
      `[analytics-service] Nouvelle commande enregistrée : #${String(payload.orderId ?? '')} — ${itemsCount} article(s) — client ${String(payload.customerId ?? '')}`,
    );
  }
}
