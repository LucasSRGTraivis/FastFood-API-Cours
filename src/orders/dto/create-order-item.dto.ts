import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: "Identifiant numérique de l'item de menu commandé",
    example: 145,
  })
  @IsInt()
  @IsPositive()
  menuItemId: number;

  @ApiProperty({
    description: "Quantité demandée pour l'item",
    example: 2,
  })
  @IsInt()
  @IsPositive()
  qty: number;
}

