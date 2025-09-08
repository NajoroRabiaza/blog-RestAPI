import prisma from "../config/database";

// creation un nouvel utilisateur en base
const createUser = async (data: {
  email: string;
  password: string;
  username: string;
}) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
};

// recherche un utilisateur par email avec mot de passe pour la verification au login
const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });
};

// recherche un utilisateur par email sans mot de passe pour les autres usages
const findUserByEmailSafe = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
};

// recherche un utilisateur par id sans exposer le mot de passe
const findUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
};

export default {
  createUser,
  findUserByEmail,
  findUserByEmailSafe,
  findUserById,
};