import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression = require('compression');
import { AppModule } from './app.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenusModule } from './menus/menus.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Compression gzip
  app.use(
    compression({
      threshold: 1024,
      level: 6,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('NexusEats API')
    .setDescription(
      'API de livraison de repas NexusEats avec gestion des restaurants, menus et items. Pagination, filtres, soft delete et relations N:M.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentification et gestion des utilisateurs')
    .addTag('restaurants', 'Gestion des restaurants avec pagination et filtres')
    .addTag('menus', 'Gestion des menus par restaurant')
    .addTag('menu-items', 'Gestion des items de menu avec catégories')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config, {
    include: [
      AuthModule,
      RestaurantsModule,
      MenusModule,
      MenuItemsModule,
      OrdersModule,
    ],
  });
  SwaggerModule.setup('api-docs', app, doc);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
