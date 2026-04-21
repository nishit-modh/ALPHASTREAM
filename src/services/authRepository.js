'use strict';

const prisma = require('../config/prisma');

const authRepository = {
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async createUser(data) {
    return prisma.user.create({
      data,
      select: { id: true, email: true, role: true, createdAt: true },
    });
  },

  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  },
};

module.exports = authRepository;
