import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin001@gmail.com' },
    update: {},
    create: {
      email: 'admin001@gmail.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('Admin user created:', admin.email);

  // Create some sample products
  const products = [
    {
      name: 'Laptop',
      description: 'High-performance laptop for professionals',
      price: 999.99,
      stock: 10,
      image: 'https://via.placeholder.com/300x300?text=Laptop',
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: 29.99,
      stock: 50,
      image: 'https://via.placeholder.com/300x300?text=Mouse',
    },
    {
      name: 'Keyboard',
      description: 'Mechanical keyboard with RGB lighting',
      price: 79.99,
      stock: 30,
      image: 'https://via.placeholder.com/300x300?text=Keyboard',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: product,
    });
  }

  console.log('Sample products created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
