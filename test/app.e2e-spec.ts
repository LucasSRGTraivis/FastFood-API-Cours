import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { execSync } from 'child_process';
import request = require('supertest');
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { useContainer } from 'class-validator';

describe('NexusEats API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let ownerToken: string;
  let customerToken: string;
  let restaurantId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL_TEST ||
      'postgresql://nexuseats:nexuseats_dev@localhost:5432/nexuseats_test';

    execSync('npx prisma migrate deploy', {
      env: { ...process.env },
      stdio: 'inherit',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

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

    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await (prisma as any).menuItem.deleteMany();
    await (prisma as any).menu.deleteMany();
    await (prisma as any).restaurant.deleteMany();
    await (prisma as any).user.deleteMany();
    await app.close();
  });

  describe('Authentification', () => {
    describe('POST /auth/register', () => {
      it('devrait créer un utilisateur avec des données valides', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'owner-test@nexus.dev',
            password: 'password123',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('timestamp');

        ownerToken = response.body.data.access_token;
      });

      it('devrait retourner 409 avec un email dupliqué', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'owner-test@nexus.dev',
            password: 'password123',
          })
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.error.statusCode).toBe(409);
        expect(response.body.error.message[0]).toContain('existe déjà');
      });
    });

    describe('POST /auth/login', () => {
      it('devrait retourner un token avec un bon mot de passe', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'owner-test@nexus.dev',
            password: 'password123',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('access_token');
        expect(response.body.data.access_token).toBeTruthy();
      });

      it('devrait retourner 401 avec un mauvais mot de passe', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'owner-test@nexus.dev',
            password: 'wrongpassword',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.statusCode).toBe(401);
      });
    });
  });

  describe('CRUD Restaurants (protégé)', () => {
    beforeAll(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      const owner = await (prisma as any).user.create({
        data: {
          email: 'owner-crud@nexus.dev',
          password: hashedPassword,
          role: 'owner',
        },
      });

      const customer = await (prisma as any).user.create({
        data: {
          email: 'customer@nexus.dev',
          password: hashedPassword,
          role: 'customer',
        },
      });

      // On génère les JWT directement pour éviter la throttling
      // configurée sur POST /auth/login (TP1).
      ownerToken = await jwtService.signAsync({
        sub: owner.id,
        email: owner.email,
        role: owner.role,
      });

      customerToken = await jwtService.signAsync({
        sub: customer.id,
        email: customer.email,
        role: customer.role,
      });
    });

    describe('POST /restaurants', () => {
      it('devrait retourner 401 SANS token', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .send({
            name: 'Test Restaurant',
            address: {
              street: '10 rue Test',
              city: 'Paris',
              zipCode: '75001',
              country: 'FR',
            },
            phone: '+33123456789',
            email: 'test@restaurant.fr',
            cuisine: 'ITALIEN',
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.statusCode).toBe(401);
      });

      it('devrait créer un restaurant AVEC token owner', async () => {
        const response = await request(app.getHttpServer())
          .post('/restaurants')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: 'Restaurant E2E Test',
            address: {
              street: '10 rue Test',
              city: 'Paris',
              zipCode: '75001',
              country: 'FR',
            },
            phone: '+33123456789',
            email: 'test@restaurant.fr',
            cuisine: 'ITALIEN',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe('Restaurant E2E Test');
        expect(response.body).toHaveProperty('timestamp');

        restaurantId = response.body.data.id;
      });
    });

    describe('GET /restaurants', () => {
      it('devrait retourner la liste des restaurants', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('meta');
        expect(Array.isArray(response.body.data.data)).toBe(true);
        expect(response.body.data.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /restaurants/:id', () => {
      it('devrait retourner un restaurant existant', async () => {
        const response = await request(app.getHttpServer())
          .get(`/restaurants/${restaurantId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(restaurantId);
        expect(response.body.data.name).toBe('Restaurant E2E Test');
      });

      it('devrait retourner 404 pour un restaurant inexistant', async () => {
        const response = await request(app.getHttpServer())
          .get('/restaurants/99999999-9999-9999-9999-999999999999')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.statusCode).toBe(404);
        expect(response.body.error.message[0]).toContain('introuvable');
      });
    });

    describe('PATCH /restaurants/:id', () => {
      it('devrait retourner 403 avec un token customer (mauvais rôle)', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/restaurants/${restaurantId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ name: 'Nom modifié' })
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.statusCode).toBe(403);
      });
    });

    describe('DELETE /restaurants/:id', () => {
      it('devrait retourner 403 avec un rôle customer (admin requis)', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/restaurants/${restaurantId}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error.statusCode).toBe(403);
        expect(response.body.error.message[0]).toContain('admin');
      });
    });
  });
});
