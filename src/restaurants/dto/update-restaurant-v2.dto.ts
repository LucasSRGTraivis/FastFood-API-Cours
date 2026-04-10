import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDtoV2 } from './create-restaurant-v2.dto';

/** DTO v2 : mise à jour partielle (PATCH). Tous les champs optionnels. */
export class UpdateRestaurantDtoV2 extends PartialType(CreateRestaurantDtoV2) {}
