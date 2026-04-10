import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  BadGatewayException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { TimeoutError, timeout } from 'rxjs';

import { Body } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';

const ORDERS_CLIENT = 'ORDERS_CLIENT';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(@Inject(ORDERS_CLIENT) private readonly client: ClientProxy) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une commande (via RabbitMQ)',
    description:
      'Envoie la demande de creation de commande au microservice Orders via RabbitMQ.',
  })
  @ApiResponse({ status: 201, description: 'Commande créée' })
  @ApiResponse({ status: 400, description: 'Payload de commande invalide.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès interdit.' })
  @ApiResponse({ status: 409, description: 'Conflit métier (commande déjà existante).' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  @ApiResponse({ status: 502, description: 'Erreur de communication avec Orders Service' })
  @ApiResponse({ status: 504, description: 'Timeout Orders Service' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderDto) {
    try {
      const obs$ = this.client
        .send('create_order', dto)
        .pipe(timeout(3000));
      return await firstValueFrom(obs$);
    } catch (e: any) {
      // Pour debug TP (connexion / pas de consumer / erreur RMQ)
      // eslint-disable-next-line no-console
      console.error('[gateway] create_order failed', {
        name: e?.name,
        message: e?.message,
        raw: e,
      });
      if (e instanceof TimeoutError) {
        throw new GatewayTimeoutException('Orders service timeout');
      }
      throw new BadGatewayException('Erreur communication Orders service');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les commandes (via RabbitMQ)',
    description:
      'Récupère la liste des commandes depuis le microservice Orders.',
  })
  @ApiResponse({ status: 200, description: 'Liste des commandes' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès interdit.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findAll() {
    const obs$ = this.client.send('get_orders', {});
    return await firstValueFrom(obs$);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'une commande (via RabbitMQ)",
    description:
      "Récupère le détail d'une commande spécifique via son identifiant.",
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    schema: { type: 'string', format: 'uuid' },
    example: '22222222-2222-4222-8222-222222222222',
  })
  @ApiResponse({ status: 200, description: 'Commande trouvée' })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès interdit.' })
  @ApiResponse({ status: 404, description: 'Commande introuvable' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findOne(@Param('id') id: string) {
    const obs$ = this.client.send('get_order_by_id', { id });
    return await firstValueFrom(obs$);
  }
}

