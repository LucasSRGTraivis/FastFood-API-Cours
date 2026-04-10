import { IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Identifiant numérique du client qui passe la commande',
    example: 42,
  })
  @IsInt()
  @IsPositive()
  customerId: number;

  @ApiProperty({
    description: 'Liste des lignes de commande',
    type: () => [CreateOrderItemDto],
    example: [{ menuItemId: 145, qty: 2 }, { menuItemId: 211, qty: 1 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

