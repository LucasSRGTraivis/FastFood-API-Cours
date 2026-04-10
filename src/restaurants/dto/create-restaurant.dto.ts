import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsUUID,
  IsEmail,
  IsOptional,
  IsNumber,
  IsISO31661Alpha2,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsUniqueRestaurantName } from '../../common/validators/is-unique-restaurant-name.validator';

export enum CuisineType {
  ITALIEN = 'ITALIEN',
  ASIATIQUE = 'ASIATIQUE',
  BURGER = 'BURGER',
  PIZZA = 'PIZZA',
  SUSHI = 'SUSHI',
  INDIEN = 'INDIEN',
  FRANCAIS = 'FRANCAIS',
  FAST_FOOD = 'FAST_FOOD',
}

export class AddressDto {
  @ApiProperty({
    description: 'Numéro et voie du restaurant',
    example: '12 rue de la Paix',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  street: string;

  @ApiProperty({
    description: 'Ville du restaurant',
    example: 'Paris',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Code postal français sur 5 chiffres',
    example: '75002',
  })
  @Matches(/^\d{5}$/)
  zipCode: string;

  @ApiProperty({
    description: 'Code pays ISO 3166-1 alpha-2',
    example: 'FR',
  })
  @IsISO31661Alpha2({
    message: 'Le code pays doit être au format ISO 3166-1 alpha-2 (ex: FR, US)',
  })
  country: string;
}

/** DTO de création d'un restaurant. Tous les champs sont requis sauf description et isActive. */
export class CreateRestaurantDto {
  @ApiProperty({
    description: 'Nom du restaurant',
    example: 'La Bella Roma',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsUniqueRestaurantName()
  name: string;

  @ApiProperty({
    description: 'Adresse complète du restaurant',
    type: () => AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
    description: 'Numéro de téléphone du restaurant',
    example: '+33 1 42 00 00 00',
  })
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone: string;

  @ApiProperty({
    description: 'Email de contact du restaurant',
    example: 'contact@labellaroma.fr',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Type de cuisine proposée',
    enum: CuisineType,
    example: CuisineType.ITALIEN,
  })
  @IsEnum(CuisineType)
  cuisine: CuisineType;

  @ApiProperty({
    description: 'Rayon de livraison en kilomètres',
    minimum: 1,
    maximum: 50,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  deliveryRadiusKm: number;

  @ApiProperty({
    description: "Heure d'ouverture (format HH:mm)",
    example: '11:00',
  })
  @IsOptional()
  @IsString()
  openingTime: string;

  @ApiProperty({
    description: 'Heure de fermeture (format HH:mm)',
    example: '23:00',
  })
  @IsOptional()
  @IsString()
  closingTime: string;

  @ApiPropertyOptional({
    description: 'Description du restaurant et de sa carte',
    example: 'Spécialités italiennes, pâtes fraîches et pizzas au feu de bois.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Restaurant actif et visible pour les commandes',
    example: true,
    required: false,
  })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Liste des IDs de catégories à associer au restaurant',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '660e8400-e29b-41d4-a716-556655440111',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
