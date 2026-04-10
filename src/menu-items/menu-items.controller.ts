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
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@ApiTags('menu-items')
@Controller('menus/:menuId/items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un item',
    description: "Crée un item rattaché à un menu existant.",
  })
  @ApiParam({
    name: 'menuId',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiResponse({ status: 201, description: 'Item créé' })
  @ApiResponse({ status: 400, description: 'Payload invalide.' })
  @ApiResponse({ status: 404, description: 'Menu introuvable.' })
  @ApiResponse({ status: 409, description: "Conflit métier lors de la création de l'item." })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async create(
    @Param('menuId') menuId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.menuItemsService.create({ ...createMenuItemDto, menuId });
  }

  @Get()
  @ApiOperation({
    summary: "Liste des items d'un menu",
    description: 'Retourne tous les items d un menu avec leurs catégories associées.',
  })
  @ApiParam({
    name: 'menuId',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiResponse({ status: 200, description: 'Liste des items avec catégories' })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 404, description: 'Menu introuvable.' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findAll(@Param('menuId') menuId: string) {
    return this.menuItemsService.findAllByMenu(menuId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un item",
    description: "Retourne les informations détaillées d'un item de menu.",
  })
  @ApiParam({
    name: 'menuId',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'item",
    schema: { type: 'string', format: 'uuid' },
    example: '44444444-4444-4444-8444-444444444444',
  })
  @ApiResponse({ status: 200, description: 'Item trouvé' })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 404, description: 'Item introuvable' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un item',
    description: 'Met a jour partiellement un item existant.',
  })
  @ApiParam({
    name: 'menuId',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'item",
    schema: { type: 'string', format: 'uuid' },
    example: '44444444-4444-4444-8444-444444444444',
  })
  @ApiResponse({ status: 200, description: 'Item mis à jour' })
  @ApiResponse({ status: 400, description: 'Payload de mise a jour invalide.' })
  @ApiResponse({ status: 404, description: 'Item introuvable' })
  @ApiResponse({ status: 409, description: "Conflit métier lors de la mise a jour de l'item." })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un item',
    description: 'Supprime logiquement un item de menu.',
  })
  @ApiParam({
    name: 'menuId',
    description: 'ID du menu',
    schema: { type: 'string', format: 'uuid' },
    example: '33333333-3333-4333-8333-333333333333',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'item",
    schema: { type: 'string', format: 'uuid' },
    example: '44444444-4444-4444-8444-444444444444',
  })
  @ApiResponse({ status: 204, description: 'Item supprimé' })
  @ApiResponse({ status: 400, description: "Format d'identifiant invalide." })
  @ApiResponse({ status: 404, description: 'Item introuvable' })
  @ApiResponse({ status: 429, description: 'Limite de requêtes dépassée.' })
  async remove(@Param('id') id: string) {
    await this.menuItemsService.remove(id);
  }
}
