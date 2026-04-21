'use strict';

const prisma = require('../config/prisma');

const signalRepository = {
  async findAll({ page, limit, ticker, type }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (ticker) where.ticker = { contains: ticker };
    if (type) where.type = type;

    const [signals, total] = await prisma.$transaction([
      prisma.signal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
      }),
      prisma.signal.count({ where }),
    ]);

    return {
      signals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id) {
    return prisma.signal.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });
  },

  async create(data) {
    return prisma.signal.create({
      data,
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });
  },

  async update(id, data) {
    return prisma.signal.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });
  },

  async delete(id) {
    return prisma.signal.delete({ where: { id } });
  },
};

module.exports = signalRepository;
