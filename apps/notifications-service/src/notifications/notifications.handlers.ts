import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationsHandlers {
  private asRecord(data: unknown): Record<string, unknown> {
    return typeof data === 'object' && data !== null
      ? (data as Record<string, unknown>)
      : {};
  }

  @EventPattern('order.created')
  handleOrderCreated(@Payload() data: unknown) {
    const payload = this.asRecord(data);

    console.log(
      `[notifications-service] Email envoyé : Commande #${String(payload.orderId ?? '')} confirmée pour le client ${String(payload.customerId ?? '')}`,
    );
  }

  @EventPattern('payment.confirmed')
  handlePaymentConfirmed(@Payload() data: unknown) {
    const payload = this.asRecord(data);

    console.log(
      `[notifications-service] Email envoyé : Paiement #${String(payload.paymentId ?? payload.orderId ?? '')} reçu`,
    );
  }

  @EventPattern('order.delivered')
  handleOrderDelivered(@Payload() data: unknown) {
    const payload = this.asRecord(data);

    console.log(
      `[notifications-service] Email envoyé : Commande #${String(payload.orderId ?? '')} livrée`,
    );
  }
}
