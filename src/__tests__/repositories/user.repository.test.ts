import userRepository from "../../repositories/user.repository";

// mock de Prisma pour eviter les appels reels a la base de donnees
jest.mock("../../config/database", () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

import prisma from "../../config/database";

const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  role: "AUTHOR",
  createdAt: new Date(),
};

const mockUserWithPassword = {
  ...mockUser,
  password: "hashedpassword123",
};

describe("createUser", () => {
  it("doit creer un utilisateur et retourner les donnees sans mot de passe", async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.createUser({
      email: "test@example.com",
      password: "hashedpassword123",
      username: "testuser",
    });

    expect(result).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it("doit propager l'erreur Prisma si l'email est duplique", async () => {
    const prismaError = { code: "P2002", message: "Unique constraint" };
    (prisma.user.create as jest.Mock).mockRejectedValue(prismaError);

    await expect(
      userRepository.createUser({
        email: "test@example.com",
        password: "hashedpassword123",
        username: "testuser",
      })
    ).rejects.toEqual(prismaError);
  });
});

describe("findUserByEmail", () => {
  it("doit retourner un utilisateur avec son mot de passe", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithPassword);

    const result = await userRepository.findUserByEmail("test@example.com");

    expect(result).toEqual(mockUserWithPassword);
    expect(result?.password).toBeDefined();
  });

  it("doit retourner null si l'utilisateur n'existe pas", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await userRepository.findUserByEmail("inconnu@example.com");

    expect(result).toBeNull();
  });
});

describe("findUserById", () => {
  it("doit retourner un utilisateur sans mot de passe", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findUserById(1);

    expect(result).toEqual(mockUser);
    expect((result as any)?.password).toBeUndefined();
  });
});