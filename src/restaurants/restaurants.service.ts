import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  lastPage?: number;
  hasNext: boolean;
  hasPrevious: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMetadata;
}

interface FindAllFilters {
  cuisine?: string;
  minRating?: number;
  isOpen?: boolean;
}

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    filters: FindAllFilters = {},
    fields?: string[],
  ): Promise<PaginatedResponse<any>> {
    const cacheKey = `restaurants:${page}:${limit}:${JSON.stringify(filters)}:${fields?.join(',')}`;
    
    // Vérifier le cache
    const cached = await this.cacheManager.get<PaginatedResponse<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = {};

    if (filters.cuisine) {
      where.cuisine = filters.cuisine;
    }

    if (filters.minRating !== undefined) {
      where.rating = { gte: filters.minRating };
    }

    if (filters.isOpen !== undefined) {
      where.isOpen = filters.isOpen;
    }

    // Sélection de champs (?fields=) avec whitelist stricte
    const allowedFields = [
      'id',
      'name',
      'cuisine',
      'address',
      'rating',
      'isOpen',
      'createdAt',
      'updatedAt',
    ];

    let select: any | undefined;
    if (fields !== undefined) {
      const requested = fields.map((f) => f.trim()).filter(Boolean);
      if (requested.length === 0) {
        throw new BadRequestException('Le paramètre "fields" ne peut pas être vide.');
      }

      const invalid = requested.filter((f) => !allowedFields.includes(f));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Champs invalides pour "fields": ${invalid.join(', ')}`,
        );
      }

      select = requested.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as any);
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).restaurant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: select || {
          id: true,
          name: true,
          cuisine: true,
          address: true,
          rating: true,
          isOpen: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      (this.prisma as any).restaurant.count({ where }),
    ]);

    const lastPage = Math.ceil(total / limit);

    const result = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: lastPage,
        lastPage,
        hasNext: page < lastPage,
        hasPrevious: page > 1,
        hasPrev: page > 1,
      },
    };

    // Stocker en cache (TTL: 60 secondes)
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }

  async findAllCursor(cursor?: string, limit = 20): Promise<any> {
    const where: any = {};

    if (cursor) {
      where.id = { gt: cursor };
    }

    const items = await (this.prisma as any).restaurant.findMany({
      where,
      take: limit + 1,
      orderBy: { id: 'asc' },
    });

    const hasNext = items.length > limit;
    const data = hasNext ? items.slice(0, limit) : items;
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return {
      data,
      meta: {
        nextCursor,
        hasNext,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const restaurant = await (this.prisma as any).restaurant.findFirst({
      where: { id },
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

    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} introuvable`);
    }

    return restaurant;
  }

  async createSimple(
    dto: { name: string; cuisine: string; address: string },
    userId: number,
  ): Promise<any> {
    const existing = await (this.prisma as any).restaurant.findFirst({
      where: {
        name: { equals: dto.name, mode: 'insensitive' },
        address: { equals: dto.address, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Un restaurant avec le nom "${dto.name}" et l'adresse "${dto.address}" existe déjà`,
      );
    }

    const data: any = {
      name: dto.name,
      address: dto.address,
      cuisine: dto.cuisine as any,
      rating: 0,
      isOpen: true,
      ownerId: userId,
    };

    return (this.prisma as any).restaurant.create({ data });
  }

  async create(dto: CreateRestaurantDto, userId: number): Promise<any> {
    const existing = await (this.prisma as any).restaurant.findFirst({
      where: {
        name: { equals: dto.name, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Un restaurant avec le nom "${dto.name}" existe déjà`,
      );
    }

    const addressString = `${dto.address.street}, ${dto.address.zipCode} ${dto.address.city}, ${dto.address.country}`;

    try {
      const restaurant = await (this.prisma as any).restaurant.create({
        data: {
          name: dto.name,
          cuisine: dto.cuisine as any,
          address: addressString,
          rating: 0,
          isOpen: true,
          ownerId: userId,
        },
      });

      // Invalider tout le cache des restaurants
      await this.invalidateCache();

      return restaurant;
    } catch (error: any) {
      // En cas d'erreur de contrainte unique Prisma, on renvoie une erreur de validation claire
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          `Le restaurant "${dto.name}" existe déjà (contrainte d'unicité).`,
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateRestaurantDto): Promise<any> {
    await this.findOne(id);

    const restaurant = await (this.prisma as any).restaurant.update({
      where: { id },
      data: dto,
    });

    // Invalider tout le cache des restaurants
    await this.invalidateCache();

    return restaurant;
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id); // Vérifier existence

    await (this.prisma as any).restaurant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Invalider tout le cache des restaurants
    await this.invalidateCache();
  }

  private async invalidateCache(): Promise<void> {
    const store = (this.cacheManager as any).store;
    if (store && typeof store.reset === 'function') {
      await store.reset();
    }
  }

  async remove(id: string): Promise<void> {
    await this.softDelete(id);
  }
}
