import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueRestaurantNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: any): Promise<boolean> {
    if (!value) return true;

    try {
      const existing = await (this.prisma as any).restaurant.findFirst({
        where: {
          name: { equals: value, mode: 'insensitive' },
          deletedAt: null,
        },
      });

      return !existing;
    } catch {
      // En cas d'erreur Prisma (connexion, schéma, etc.),
      // on ne bloque pas les autres validations.
      return true;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `Le restaurant "${args.value}" existe déjà.`;
  }
}

export function IsUniqueRestaurantName(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: Object, propertyName: string | symbol) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueRestaurantNameConstraint,
    });
  };
}

