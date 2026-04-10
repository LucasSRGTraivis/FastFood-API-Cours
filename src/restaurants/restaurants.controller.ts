import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('restaurants')
@Controller({ path: 'restaurants', version: '1' })
export class RestaurantsV1Controller {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer un nouveau restaurant (owner, admin)',
    description:
      "Crée un restaurant pour l'utilisateur connecté avec ses informations métier (adresse, cuisine, horaires, catégories).",
  })
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({ status: 201, description: 'Restaurant créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé (rôle insuffisant).' })
  @ApiResponse({ status: 409, description: 'Conflit : restaurant existe déjà.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async create(@Body() dto: CreateRestaurantDto, @CurrentUser() user: any) {
    return this.restaurantsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste paginée des restaurants avec filtres (pagination offset)',
    description:
      'Retourne la liste des restaurants avec pagination page/limit, filtres métier et projection de champs.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de page (défaut : 1)',
    schema: { type: 'integer', minimum: 1, default: 1 },
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre d\'éléments par page (défaut : 20, max : 100)',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    example: 20,
  })
  @ApiQuery({
    name: 'cuisine',
    required: false,
    enum: ['ITALIEN', 'ASIATIQUE', 'BURGER', 'PIZZA', 'SUSHI', 'INDIEN', 'FRANCAIS', 'FAST_FOOD'],
    description: 'Filtrer par type de cuisine',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
    description: 'Note minimale (0-5)',
    schema: { type: 'number', minimum: 0, maximum: 5 },
  })
  @ApiQuery({
    name: 'isOpen',
    required: false,
    type: Boolean,
    description: 'Filtrer par statut ouvert/fermé',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    type: String,
    description: 'Sélection de champs (ex: id,name,cuisine,rating)',
    example: 'id,name,cuisine,rating',
  })
  @ApiResponse({ status: 200, description: 'Liste avec pagination et métadonnées.' })
  @ApiResponse({ status: 400, description: 'Paramètres de requête invalides.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('cuisine') cuisine?: string,
    @Query('minRating') minRating?: number,
    @Query('isOpen') isOpen?: string,
    @Query('fields') fields?: string,
  ): Promise<any> {
    if (limit > 100) {
      limit = 100;
    }

    const filters: any = {};
    if (cuisine) filters.cuisine = cuisine;
    if (minRating !== undefined) filters.minRating = Number(minRating);
    if (isOpen !== undefined) filters.isOpen = isOpen === 'true';

    const selectedFields = fields ? fields.split(',').map(f => f.trim()) : undefined;

    return this.restaurantsService.findAll(page, limit, filters, selectedFields);
  }

  @Get('scroll')
  @ApiOperation({
    summary: 'Liste des restaurants avec pagination cursor (scroll infini)',
    description:
      "Retourne une page de restaurants basée sur un curseur, adaptée au scroll infini côté mobile.",
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Curseur pour la pagination (ID du dernier élément)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre d\'éléments à retourner (défaut : 20, max : 100)',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    example: 20,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste avec curseur pour la page suivante.',
    schema: {
      example: {
        success: true,
        data: {
          data: [{ id: 'uuid', name: 'Restaurant' }],
          meta: { nextCursor: 'uuid', hasNext: true },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Paramètres de requête invalides.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async scroll(
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const validLimit = Math.min(limit, 100);
    return this.restaurantsService.findAllCursor(cursor, validLimit);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un restaurant avec menus et items",
    description:
      "Retourne le restaurant demandé avec ses relations utiles (menus et items) pour affichage détaillé.",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiResponse({ status: 200, description: 'Restaurant trouvé avec relations.' })
  @ApiResponse({ status: 404, description: 'Restaurant introuvable.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findOne(@Param('id') id: string) {
    const restaurant = await this.restaurantsService.findOne(id);

    const [street = restaurant.address, rest = ''] = String(restaurant.address ?? '').split(',');
    const city = rest.trim().split(' ').slice(1).join(' ') || '';

    return {
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      address: {
        street: street.trim(),
        city: city.trim(),
      },
      rating: restaurant.rating,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Modifier partiellement un restaurant (owner, admin)',
    description:
      'Met a jour uniquement les champs fournis pour un restaurant existant.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({ status: 200, description: 'Restaurant mis à jour.' })
  @ApiResponse({ status: 400, description: 'Payload de mise a jour invalide.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé (rôle insuffisant).' })
  @ApiResponse({ status: 404, description: 'Restaurant introuvable.' })
  @ApiResponse({ status: 409, description: 'Conflit.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un restaurant (admin uniquement)',
    description:
      'Effectue un soft delete du restaurant cible (suppression logique).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 204, description: 'Restaurant supprimé (soft delete).' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @ApiResponse({ status: 403, description: 'Accès refusé (admin uniquement).' })
  @ApiResponse({ status: 404, description: 'Restaurant introuvable.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async remove(@Param('id') id: string) {
    await this.restaurantsService.remove(id);
  }
}
