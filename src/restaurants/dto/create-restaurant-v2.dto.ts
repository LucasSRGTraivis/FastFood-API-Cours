import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuisineType } from './create-restaurant.dto';

/** DTO v2 : création avec countryCode + localNumber à la place de phone. */
export class CreateRestaurantDtoV2 {
  @ApiProperty({ example: 'Chez Marco' })
  name: string;

  @ApiProperty({
    description: 'Adresse complète du restaurant',
    example: '12 rue de la Paix, 75002 Paris',
  })
  address: string;

  @ApiProperty({ example: '+33', description: 'Indicatif pays' })
  countryCode: string;

  @ApiProperty({ example: '612345678', description: 'Numéro local' })
  localNumber: string;

  @ApiProperty({
    description: 'Type de cuisine proposée',
    enum: CuisineType,
    example: CuisineType.ITALIEN,
  })
  cuisineType: CuisineType;

  @ApiProperty({
    description: 'Rayon de livraison en kilomètres',
    minimum: 1,
    maximum: 50,
    example: 5,
  })
  deliveryRadiusKm: number;

  @ApiProperty({
    description: "Heure d'ouverture (format HH:mm)",
    example: '11:00',
  })
  openingTime: string;

  @ApiProperty({
    description: 'Heure de fermeture (format HH:mm)',
    example: '23:00',
  })
  closingTime: string;

  @ApiPropertyOptional({
    description: 'Description du restaurant et de sa carte',
    example: 'Spécialités italiennes, pâtes fraîches et pizzas au feu de bois.',
    required: false,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Restaurant actif et visible pour les commandes',
    example: true,
    required: false,
  })
  isActive?: boolean;
}
