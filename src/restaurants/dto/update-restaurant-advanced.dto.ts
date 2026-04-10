import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';

export class UpdateRestaurantAdvancedDto extends PartialType(CreateRestaurantDto) {}

