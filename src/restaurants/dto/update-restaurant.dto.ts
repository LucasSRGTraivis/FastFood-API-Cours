import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';

/** DTO de mise à jour partielle (PATCH). Tous les champs sont optionnels. */
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}
