import { Module } from '@nestjs/common';
import { IsUniqueRestaurantNameConstraint } from './validators/is-unique-restaurant-name.validator';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IsUniqueRestaurantNameConstraint],
  exports: [IsUniqueRestaurantNameConstraint],
})
export class CommonModule {}
