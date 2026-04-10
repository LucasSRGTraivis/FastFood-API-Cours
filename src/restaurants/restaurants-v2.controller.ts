import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { RestaurantV2ResponseDto } from './dto/restaurant-v2-response.dto';

@ApiTags('restaurants')
@Controller({ path: 'restaurants', version: '2' })
export class RestaurantsV2Controller {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Détail d un restaurant (v2)',
    description:
      'Retourne un format enrichi avec location (adresse détaillée + coordonnées GPS) et deliveryRadius.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du restaurant',
    schema: { type: 'string', format: 'uuid' },
    example: '11111111-1111-4111-8111-111111111111',
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant trouvé au format v2.',
    type: RestaurantV2ResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Restaurant introuvable.' })
  async findOne(@Param('id') id: string): Promise<RestaurantV2ResponseDto> {
    const restaurant = await this.restaurantsService.findOne(id);
    const fullAddress = String(restaurant.address ?? '');
    const [street = fullAddress, rest = ''] = fullAddress.split(',');
    const zipAndCity = rest.trim().split(' ');
    const zipCode = zipAndCity[0] ?? '75001';
    const city = zipAndCity.slice(1).join(' ') || 'Paris';

    // Valeurs de demo stables pour le TP si la base ne stocke pas encore de GPS.
    const lat = 48.8566;
    const lng = 2.3522;

    return {
      id: restaurant.id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      location: {
        address: {
          street: street.trim(),
          city,
          zipCode,
        },
        coordinates: { lat, lng },
      },
      rating: restaurant.rating,
      deliveryRadius: 5,
    };
  }
}
