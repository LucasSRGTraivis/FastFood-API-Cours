import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationsHandlers {
  @EventPattern('order.created')
  handleOrderCreated(@Payload() data: any) {
    // eslint-disable-next-line no-console
    console.log(
      `[notifications-service] Email envoyé : Commande #${data.orderId} confirmée pour le client ${data.customerId}`,
    );
  }

  @EventPattern('payment.confirmed')
  handlePaymentConfirmed(@Payload() data: any) {
    // eslint-disable-next-line no-console
    console.log(
      `[notifications-service] Email envoyé : Paiement #${data.paymentId ?? data.orderId} reçu`,
    );
  }

  @EventPattern('order.delivered')
  handleOrderDelivered(@Payload() data: any) {
    // eslint-disable-next-line no-console
    console.log(
      `[notifications-service] Email envoyé : Commande #${data.orderId} livrée`,
    );
  }
}
