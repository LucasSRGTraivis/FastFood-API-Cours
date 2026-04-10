import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('menus')
@Controller('restaurants/:restaurantId/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un menu',
    description: "Crée un menu rattaché à un restaurant existant.",
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiResponse({ status: 201, description: 'Menu créé' })
  @ApiResponse({ status: 400, description: 'Payload invalide.' })
  @ApiResponse({ status: 404, description: 'Restaurant introuvable.' })
  @ApiResponse({ status: 409, description: 'Conflit sur les données du menu.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return this.menusService.create({ ...createMenuDto, restaurantId });
  }

  @Get()
  @ApiOperation({
    summary: "Liste des menus d'un restaurant",
    description: 'Retourne tous les menus rattachés au restaurant ciblé.',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiResponse({ status: 200, description: 'Liste des menus avec items' })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 404, description: 'Restaurant introuvable.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findAll(@Param('restaurantId') restaurantId: string) {
    return this.menusService.findAllByRestaurant(restaurantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un menu",
    description: 'Retourne le détail complet du menu demandé.',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiResponse({ status: 200, description: 'Menu trouvé' })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 404, description: 'Menu introuvable' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un menu',
    description: 'Met a jour les champs fournis du menu.',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiResponse({ status: 200, description: 'Menu mis à jour' })
  @ApiResponse({ status: 400, description: 'Payload de mise a jour invalide.' })
  @ApiResponse({ status: 404, description: 'Menu introuvable' })
  @ApiResponse({ status: 409, description: 'Conflit sur les données du menu.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un menu',
    description: 'Supprime logiquement un menu existant.',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiResponse({ status: 204, description: 'Menu supprimé' })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 404, description: 'Menu introuvable' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async remove(@Param('id') id: string) {
    await this.menusService.remove(id);
  }
}
