'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const userPassword = await bcrypt.hash('User@1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alphastream.io' },
    update: {},
    create: {
      email: 'admin@alphastream.io',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@alphastream.io' },
    update: {},
    create: {
      email: 'user@alphastream.io',
      password: userPassword,
      role: 'USER',
    },
  });

  const signals = [
    { ticker: 'BTC/USDT', type: 'BUY',  entryPrice: 65420.50, confidenceLevel: 0.92, createdBy: admin.id },
    { ticker: 'ETH/USDT', type: 'BUY',  entryPrice: 3210.00,  confidenceLevel: 0.85, createdBy: admin.id },
    { ticker: 'SOL/USDT', type: 'SELL', entryPrice: 178.50,   confidenceLevel: 0.74, createdBy: admin.id },
    { ticker: 'BNB/USDT', type: 'BUY',  entryPrice: 580.00,   confidenceLevel: 0.68, createdBy: admin.id },
    { ticker: 'ARB/USDT', type: 'SELL', entryPrice: 1.24,     confidenceLevel: 0.55, createdBy: admin.id },
  ];

  for (const signal of signals) {
    await prisma.signal.create({ data: signal });
  }

  console.log(`Seeded: admin(${admin.email}), user(${user.email}), ${signals.length} signals`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
