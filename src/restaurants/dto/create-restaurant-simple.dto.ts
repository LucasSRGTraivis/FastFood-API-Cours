import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateRestaurantSimpleDto {
  @ApiProperty({ example: 'Sakura' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'SUSHI',
    enum: [
      'ITALIEN',
      'ASIATIQUE',
      'BURGER',
      'PIZZA',
      'SUSHI',
      'INDIEN',
      'FRANCAIS',
      'FAST_FOOD',
    ],
  })
  @IsEnum([
    'ITALIEN',
    'ASIATIQUE',
    'BURGER',
    'PIZZA',
    'SUSHI',
    'INDIEN',
    'FRANCAIS',
    'FAST_FOOD',
  ])
  @IsNotEmpty()
  cuisine: string;

  @ApiProperty({ example: '5 rue du Temple' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
