import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsBoolean, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({
    description: "Nom affiché de l'item dans l'application",
    example: 'Spaghetti Carbonara',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Prix de vente en euros',
    example: 14.9,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Indique si le produit est commandable',
    example: true,
  })
  @IsBoolean()
  available: boolean;

  @ApiProperty({
    description: 'Identifiant du menu auquel rattacher cet item',
    example: '33333333-3333-4333-8333-333333333333',
    format: 'uuid',
  })
  @IsUUID('4')
  menuId: string;

  @ApiPropertyOptional({
    description: "Liste des identifiants de catégories à associer à l'item",
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '660e8400-e29b-41d4-a716-556655440111',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
