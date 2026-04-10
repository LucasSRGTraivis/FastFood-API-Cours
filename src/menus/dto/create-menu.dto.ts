import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Nom commercial du menu',
    example: 'Menu Dejeuner Semaine',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description courte du menu',
    example: 'Formule midi avec entree, plat et dessert.',
  })
  description?: string;

  @ApiProperty({
    description: 'Identifiant du restaurant proprietaire du menu',
    example: '11111111-1111-4111-8111-111111111111',
    format: 'uuid',
  })
  restaurantId: string;
}
