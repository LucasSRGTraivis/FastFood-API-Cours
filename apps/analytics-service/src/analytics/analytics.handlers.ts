import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AnalyticsHandlers {
  @EventPattern('order.created')
  handleOrderCreated(@Payload() data: any) {
    // eslint-disable-next-line no-console
    console.log(
      `[analytics-service] Nouvelle commande enregistrée : #${data.orderId} — ${data.items?.length ?? 0} article(s) — client ${data.customerId}`,
    );
  }
}
