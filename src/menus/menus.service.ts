import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByRestaurant(restaurantId: string) {
    return (this.prisma as any).menu.findMany({
      where: { restaurantId },
      include: {
        items: {
          include: {
            categories: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const menu = await (this.prisma as any).menu.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            categories: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu #${id} introuvable`);
    }

    return menu;
  }

  async create(createMenuDto: CreateMenuDto) {
    return (this.prisma as any).menu.create({
      data: createMenuDto,
      include: {
        items: true,
      },
    });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    await this.findOne(id);

    return (this.prisma as any).menu.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await (this.prisma as any).menu.delete({
      where: { id },
    });
  }
}
