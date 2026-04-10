import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsISO31661Alpha2 } from 'class-validator';

export class AddressDto {
  @ApiProperty({ example: '12 rue de la Paix' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '75002' })
  @Matches(/^\d{5}$/, { message: 'Le code postal doit contenir exactement 5 chiffres' })
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ example: 'FR' })
  @IsISO31661Alpha2({ message: 'Le code pays doit être au format ISO 3166-1 alpha-2 (ex: FR, US)' })
  @IsNotEmpty()
  country: string;
}
