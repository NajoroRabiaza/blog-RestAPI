import userService from "../../services/user.service";

jest.mock("../../repositories/user.repository");
jest.mock("../../utils/jwt");
jest.mock("../../config/redis");

import userRepository from "../../repositories/user.repository";
import jwtUtils from "../../utils/jwt";
import redis from "../../config/redis";
import bcrypt from "bcryptjs";

const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  role: "AUTHOR",
  createdAt: new Date(),
};

const mockUserWithPassword = {
  ...mockUser,
  password: "$2b$12$hashedpassword",
};

describe("registerUser", () => {
  it("doit creer un user et retourner un token", async () => {
    (userRepository.findUserByEmailSafe as jest.Mock).mockResolvedValue(null);
    (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
    (jwtUtils.generateToken as jest.Mock).mockReturnValue("mock.jwt.token");

    const result = await userService.registerUser({
      email: "test@example.com",
      password: "password123",
      username: "testuser",
    });

    expect(result.token).toBe("mock.jwt.token");
    expect(result.user).toEqual(mockUser);
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
  });

  it("doit lancer une erreur 409 si l'email existe deja", async () => {
    (userRepository.findUserByEmailSafe as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      userService.registerUser({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe("loginUser", () => {
  it("doit retourner un token pour des credentials valides", async () => {
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(
      mockUserWithPassword
    );
    (jwtUtils.generateToken as jest.Mock).mockReturnValue("mock.jwt.token");

    // on mocke bcrypt.compare pour retourner true
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const result = await userService.loginUser({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.token).toBe("mock.jwt.token");
    expect(result.user).not.toHaveProperty("password");
  });

  it("doit lancer une erreur 401 si l'email n'existe pas", async () => {
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      userService.loginUser({
        email: "inconnu@example.com",
        password: "password123",
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("doit lancer une erreur 401 si le mot de passe est incorrect", async () => {
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(
      mockUserWithPassword
    );
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    await expect(
      userService.loginUser({
        email: "test@example.com",
        password: "mauvais_mdp",
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("logoutUser", () => {
  it("doit blacklister le token dans Redis", async () => {
    (jwtUtils.getTokenRemainingTTL as jest.Mock).mockReturnValue(3600);
    (redis.set as jest.Mock) = jest.fn().mockResolvedValue("OK");

    await userService.logoutUser("mock.jwt.token");

    expect(redis.set).toHaveBeenCalledWith(
      "blacklist:mock.jwt.token",
      "1",
      "EX",
      3600
    );
  });

  it("doit ne rien faire si le token est deja expire", async () => {
    (jwtUtils.getTokenRemainingTTL as jest.Mock).mockReturnValue(0);

    await userService.logoutUser("token.expire");

    expect(redis.set).not.toHaveBeenCalled();
  });
});