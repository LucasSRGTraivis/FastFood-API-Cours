import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByMenu(menuId: string) {
    return (this.prisma as any).menuItem.findMany({
      where: { menuId },
      include: {
        categories: true,
      },
    });
  }

  async findOne(id: string) {
    const item = await (this.prisma as any).menuItem.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`MenuItem #${id} introuvable`);
    }

    return item;
  }

  async create(createMenuItemDto: CreateMenuItemDto) {
    const { categoryIds, ...data } = createMenuItemDto;

    return (this.prisma as any).menuItem.create({
      data: {
        ...data,
        categories: categoryIds
          ? {
              connect: categoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        categories: true,
      },
    });
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    await this.findOne(id);

    const { categoryIds, ...data } = updateMenuItemDto;

    return (this.prisma as any).menuItem.update({
      where: { id },
      data: {
        ...data,
        categories: categoryIds
          ? {
              set: categoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        categories: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await (this.prisma as any).menuItem.delete({
      where: { id },
    });
  }
}
