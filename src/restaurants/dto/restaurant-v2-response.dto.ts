import { ApiProperty } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({
    description: 'Latitude GPS du restaurant',
    example: 48.8566,
  })
  lat: number;

  @ApiProperty({
    description: 'Longitude GPS du restaurant',
    example: 2.3522,
  })
  lng: number;
}

export class AddressV2Dto {
  @ApiProperty({
    description: 'Rue et numéro du restaurant',
    example: '1 rue de Rivoli',
  })
  street: string;

  @ApiProperty({
    description: 'Ville du restaurant',
    example: 'Paris',
  })
  city: string;

  @ApiProperty({
    description: 'Code postal',
    example: '75001',
  })
  zipCode: string;
}

export class LocationDto {
  @ApiProperty({
    description: 'Adresse détaillée du restaurant',
    type: () => AddressV2Dto,
  })
  address: AddressV2Dto;

  @ApiProperty({
    description: 'Coordonnées GPS du restaurant',
    type: () => CoordinatesDto,
  })
  coordinates: CoordinatesDto;
}

export class RestaurantV2ResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du restaurant',
    example: '11111111-1111-4111-8111-111111111111',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nom commercial du restaurant',
    example: 'Chez Marco',
  })
  name: string;

  @ApiProperty({
    description: 'Type de cuisine',
    example: 'ITALIEN',
  })
  cuisine: string;

  @ApiProperty({
    description: 'Bloc location enrichi (adresse + GPS)',
    type: () => LocationDto,
  })
  location: LocationDto;

  @ApiProperty({
    description: 'Note moyenne du restaurant',
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: 'Rayon de livraison en kilomètres',
    example: 5,
  })
  deliveryRadius: number;
}
