import { PrismaClient, CuisineType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {

  await prisma.category.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // Créer un utilisateur owner par défaut pour le seed
  const defaultOwner = await prisma.user.create({
    data: {
      email: 'seed-owner@nexuseats.dev',
      password: '$2b$10$defaulthashforseeding',
      role: 'owner',
    },
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Entrées' } }),
    prisma.category.create({ data: { name: 'Plats' } }),
    prisma.category.create({ data: { name: 'Desserts' } }),
    prisma.category.create({ data: { name: 'Boissons' } }),
    prisma.category.create({ data: { name: 'Végétarien' } }),
  ]);

  // Restaurant 1 : La Bella Roma (Italien)
  const bellroma = await prisma.restaurant.create({
    data: {
      name: 'La Bella Roma',
      cuisine: CuisineType.ITALIEN,
      address: '12 rue de la Paix, 75002 Paris',
      rating: 4.5,
      isOpen: true,
      ownerId: defaultOwner.id,
      menus: {
        create: [
          {
            name: 'Menu Déjeuner',
            description: 'Formule midi avec entrée, plat et dessert',
            items: {
              create: [
                {
                  name: 'Bruschetta',
                  price: 8.50,
                  available: true,
                  categories: { connect: [{ id: categories[0].id }] },
                },
                {
                  name: 'Spaghetti Carbonara',
                  price: 14.90,
                  available: true,
                  categories: { connect: [{ id: categories[1].id }] },
                },
                {
                  name: 'Tiramisu',
                  price: 6.50,
                  available: true,
                  categories: { connect: [{ id: categories[2].id }] },
                },
              ],
            },
          },
          {
            name: 'Menu Soir',
            description: 'Carte complète avec spécialités',
            items: {
              create: [
                {
                  name: 'Carpaccio de bœuf',
                  price: 12.00,
                  available: true,
                  categories: { connect: [{ id: categories[0].id }] },
                },
                {
                  name: 'Pizza Margherita',
                  price: 11.50,
                  available: true,
                  categories: { connect: [{ id: categories[1].id }, { id: categories[4].id }] },
                },
                {
                  name: 'Panna Cotta',
                  price: 7.00,
                  available: true,
                  categories: { connect: [{ id: categories[2].id }] },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Restaurant 2 : Le Dragon d'Or (Asiatique)
  const dragon = await prisma.restaurant.create({
    data: {
      name: 'Le Dragon d\'Or',
      cuisine: CuisineType.ASIATIQUE,
      address: '45 avenue des Champs-Élysées, 75008 Paris',
      rating: 4.2,
      isOpen: true,
      ownerId: defaultOwner.id,
      menus: {
        create: [
          {
            name: 'Menu Express',
            description: 'Formule rapide midi',
            items: {
              create: [
                {
                  name: 'Nems au porc',
                  price: 6.00,
                  available: true,
                  categories: { connect: [{ id: categories[0].id }] },
                },
                {
                  name: 'Bœuf sauté aux légumes',
                  price: 13.50,
                  available: true,
                  categories: { connect: [{ id: categories[1].id }] },
                },
                {
                  name: 'Perles de coco',
                  price: 5.50,
                  available: true,
                  categories: { connect: [{ id: categories[2].id }] },
                },
              ],
            },
          },
          {
            name: 'Menu Découverte',
            description: 'Assortiment de spécialités',
            items: {
              create: [
                {
                  name: 'Raviolis vapeur',
                  price: 8.00,
                  available: true,
                  categories: { connect: [{ id: categories[0].id }] },
                },
                {
                  name: 'Pad Thaï végétarien',
                  price: 12.00,
                  available: true,
                  categories: { connect: [{ id: categories[1].id }, { id: categories[4].id }] },
                },
                {
                  name: 'Thé vert',
                  price: 3.00,
                  available: true,
                  categories: { connect: [{ id: categories[3].id }] },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Restaurant 3 : Burger King (Fast Food)
  const burgerKing = await prisma.restaurant.create({
    data: {
      name: 'Burger King',
      cuisine: CuisineType.FAST_FOOD,
      address: '10 boulevard Saint-Michel, 75005 Paris',
      rating: 3.8,
      isOpen: true,
      ownerId: defaultOwner.id,
      menus: {
        create: [
          {
            name: 'Menu Best Of',
            description: 'Les classiques',
            items: {
              create: [
                {
                  name: 'Whopper',
                  price: 9.90,
                  available: true,
                  categories: { connect: [{ id: categories[1].id }] },
                },
                {
                  name: 'Frites moyennes',
                  price: 3.50,
                  available: true,
                  categories: { connect: [{ id: categories[1].id }] },
                },
                {
                  name: 'Coca-Cola',
                  price: 2.50,
                  available: true,
                  categories: { connect: [{ id: categories[3].id }] },
                },
              ],
            },
          },
          {
            name: 'Menu Veggie',
            description: 'Options végétariennes',
            items: {
              create: [
                {
                  name: 'Veggie Burger',
                  price: 8.50,
                  available: true,
                  categories: { connect: [{ id: categories[1].id }, { id: categories[4].id }] },
                },
                {
                  name: 'Onion Rings',
                  price: 3.00,
                  available: true,
                  categories: { connect: [{ id: categories[0].id }, { id: categories[4].id }] },
                },
                {
                  name: 'Sundae Chocolat',
                  price: 2.90,
                  available: true,
                  categories: { connect: [{ id: categories[2].id }] },
                },
              ],
            },
          },
        ],
      },
    },
  });

}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
