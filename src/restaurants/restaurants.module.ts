import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsV1Controller } from './restaurants.controller';
import { RestaurantsV2Controller } from './restaurants-v2.controller';
import { IsUniqueRestaurantNameConstraint } from '../common/validators/is-unique-restaurant-name.validator';

@Module({
  imports: [CacheModule.register()],
  controllers: [RestaurantsV1Controller, RestaurantsV2Controller],
  providers: [RestaurantsService, IsUniqueRestaurantNameConstraint],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
