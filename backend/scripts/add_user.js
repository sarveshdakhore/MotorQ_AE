import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function addUsers() {
  try {
    // Hash passwords
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const operatorPassword = await bcrypt.hash('operator123', saltRounds);
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({ 
      where: { email: 'admin@motorq.com' } 
    });
    
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: 'admin@motorq.com',
          password: adminPassword,
          role: 'ADMIN'
        }
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    // Check if operator user already exists
    const existingOperator = await prisma.user.findUnique({ 
      where: { email: 'operator@motorq.com' } 
    });
    
    if (!existingOperator) {
      await prisma.user.create({
        data: {
          email: 'operator@motorq.com',
          password: operatorPassword,
          role: 'OPERATOR'
        }
      });
      console.log('Operator user created successfully');
    } else {
      console.log('Operator user already exists');
    }
    
    console.log('User seeding completed');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addUsers();