import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RestaurantsService } from './restaurants.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let prismaService: PrismaService;
  let cacheManager: any;

  const mockPrismaService = {
    restaurant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    store: {
      reset: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('devrait retourner la liste paginée des restaurants (cache MISS)', async () => {
      const mockRestaurants = [
        {
          id: '1',
          name: 'La Bella Roma',
          cuisine: 'ITALIEN',
          address: '12 rue de la Paix',
          rating: 4.5,
          isOpen: true,
        },
      ];

      mockCacheManager.get.mockResolvedValue(null); // Cache MISS
      mockPrismaService.restaurant.findMany.mockResolvedValue(mockRestaurants);
      mockPrismaService.restaurant.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockRestaurants);
      expect(result.meta.total).toBe(1);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockPrismaService.restaurant.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          cuisine: true,
          address: true,
          rating: true,
          isOpen: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        result,
        60000,
      );
    });

    it('devrait retourner depuis le cache (cache HIT)', async () => {
      const cachedData = {
        data: [{ id: '1', name: 'Cached Restaurant' }],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockCacheManager.get.mockResolvedValue(cachedData); // Cache HIT

      const result = await service.findAll(1, 10);

      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockPrismaService.restaurant.findMany).not.toHaveBeenCalled();
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });

    it('devrait appliquer les filtres (cuisine, minRating, isOpen)', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.restaurant.findMany.mockResolvedValue([]);
      mockPrismaService.restaurant.count.mockResolvedValue(0);

      await service.findAll(1, 10, {
        cuisine: 'ITALIEN',
        minRating: 4.0,
        isOpen: true,
      });

      expect(mockPrismaService.restaurant.findMany).toHaveBeenCalledWith({
        where: {
          cuisine: 'ITALIEN',
          rating: { gte: 4.0 },
          isOpen: true,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          cuisine: true,
          address: true,
          rating: true,
          isOpen: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('devrait calculer correctement la pagination', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.restaurant.findMany.mockResolvedValue([]);
      mockPrismaService.restaurant.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(result.meta.total).toBe(25);
      expect(result.meta.page).toBe(2);
      expect(result.meta.lastPage).toBe(3);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(true);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un restaurant existant avec menus et items', async () => {
      const mockRestaurant = {
        id: '1',
        name: 'La Bella Roma',
        menus: [{ id: 'm1', name: 'Menu du jour', items: [] }],
      };

      mockPrismaService.restaurant.findFirst.mockResolvedValue(mockRestaurant);

      const result = await service.findOne('1');

      expect(result).toEqual(mockRestaurant);
      expect(mockPrismaService.restaurant.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          menus: {
            include: {
              items: {
                include: {
                  categories: true,
                },
              },
            },
          },
        },
      });
    });

    it("devrait lever NotFoundException si le restaurant n'existe pas", async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow(
        'Restaurant #999 introuvable',
      );
    });
  });

  describe('create', () => {
    const mockDto = {
      name: 'Nouveau Restaurant',
      address: {
        street: '10 rue Test',
        city: 'Paris',
        zipCode: '75001',
        country: 'FR',
      },
      phone: '+33123456789',
      email: 'test@restaurant.fr',
      cuisine: 'ITALIEN' as any,
    };

    it('devrait créer un restaurant avec succès et invalider le cache', async () => {
      const mockCreatedRestaurant = {
        id: '1',
        name: mockDto.name,
        cuisine: mockDto.cuisine,
        address: '10 rue Test, 75001 Paris, FR',
        rating: 0,
        isOpen: true,
        ownerId: 1,
      };

      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);
      mockPrismaService.restaurant.create.mockResolvedValue(
        mockCreatedRestaurant,
      );
      mockCacheManager.store.reset.mockResolvedValue(undefined);

      const result = await service.create(mockDto, 1);

      expect(result).toEqual(mockCreatedRestaurant);
      expect(mockPrismaService.restaurant.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: mockDto.name, mode: 'insensitive' },
        },
      });
      expect(mockPrismaService.restaurant.create).toHaveBeenCalledWith({
        data: {
          name: mockDto.name,
          cuisine: mockDto.cuisine,
          address: '10 rue Test, 75001 Paris, FR',
          rating: 0,
          isOpen: true,
          ownerId: 1,
        },
      });
      expect(mockCacheManager.store.reset).toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le nom existe déjà', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue({
        id: '1',
        name: mockDto.name,
      });

      await expect(service.create(mockDto, 1)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockDto, 1)).rejects.toThrow(
        `Un restaurant avec le nom "${mockDto.name}" existe déjà`,
      );
      expect(mockPrismaService.restaurant.create).not.toHaveBeenCalled();
    });

    it('devrait propager les erreurs Prisma non gérées', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);

      const prismaError: any = new Error('Database error');
      prismaError.code = 'P2003';

      mockPrismaService.restaurant.create.mockRejectedValue(prismaError);

      await expect(service.create(mockDto, 1)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    const mockUpdateDto = {
      name: 'Nom modifié',
      cuisine: 'ASIATIQUE' as any,
    };

    it('devrait mettre à jour un restaurant existant et invalider le cache', async () => {
      const mockExistingRestaurant = {
        id: '1',
        name: 'Ancien nom',
      };
      const mockUpdatedRestaurant = {
        id: '1',
        name: mockUpdateDto.name,
        cuisine: mockUpdateDto.cuisine,
      };

      mockPrismaService.restaurant.findFirst.mockResolvedValue(
        mockExistingRestaurant,
      );
      mockPrismaService.restaurant.update.mockResolvedValue(
        mockUpdatedRestaurant,
      );
      mockCacheManager.store.reset.mockResolvedValue(undefined);

      const result = await service.update('1', mockUpdateDto);

      expect(result).toEqual(mockUpdatedRestaurant);
      expect(mockPrismaService.restaurant.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockUpdateDto,
      });
      expect(mockCacheManager.store.reset).toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si le restaurant n'existe pas", async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);

      await expect(service.update('999', mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.restaurant.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('devrait soft delete un restaurant existant et invalider le cache', async () => {
      const mockRestaurant = {
        id: '1',
        name: 'Restaurant à supprimer',
      };

      mockPrismaService.restaurant.findFirst.mockResolvedValue(mockRestaurant);
      mockPrismaService.restaurant.update.mockResolvedValue({
        ...mockRestaurant,
        deletedAt: new Date(),
      });
      mockCacheManager.store.reset.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockPrismaService.restaurant.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(mockCacheManager.store.reset).toHaveBeenCalled();
    });

    it("devrait lever NotFoundException si le restaurant n'existe pas", async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.restaurant.update).not.toHaveBeenCalled();
    });
  });

  describe('createSimple', () => {
    const mockSimpleDto = {
      name: 'Restaurant Simple',
      cuisine: 'ITALIEN',
      address: '5 rue Test',
    };

    it('devrait créer un restaurant simple avec succès', async () => {
      const mockCreatedRestaurant = {
        id: '1',
        name: mockSimpleDto.name,
        cuisine: mockSimpleDto.cuisine,
        address: mockSimpleDto.address,
        rating: 0,
        isOpen: true,
        ownerId: 1,
      };

      mockPrismaService.restaurant.findFirst.mockResolvedValue(null);
      mockPrismaService.restaurant.create.mockResolvedValue(
        mockCreatedRestaurant,
      );

      const result = await service.createSimple(mockSimpleDto, 1);

      expect(result).toEqual(mockCreatedRestaurant);
      expect(mockPrismaService.restaurant.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: mockSimpleDto.name, mode: 'insensitive' },
          address: { equals: mockSimpleDto.address, mode: 'insensitive' },
        },
      });
    });

    it('devrait lever ConflictException si nom et adresse existent déjà', async () => {
      mockPrismaService.restaurant.findFirst.mockResolvedValue({
        id: '1',
        name: mockSimpleDto.name,
        address: mockSimpleDto.address,
      });

      await expect(service.createSimple(mockSimpleDto, 1)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createSimple(mockSimpleDto, 1)).rejects.toThrow(
        /existe déjà/,
      );
    });
  });
});
