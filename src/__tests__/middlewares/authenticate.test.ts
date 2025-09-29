import { Request, Response, NextFunction } from "express";
import authenticate from "../../middlewares/authenticate";

jest.mock("../../utils/jwt");
jest.mock("../../config/redis");

import jwtUtils from "../../utils/jwt";
import redis from "../../config/redis";

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

const createMockRequest = (authHeader?: string): Partial<Request> => ({
  headers: {
    authorization: authHeader,
  },
});

const mockResponse = {} as Response;

beforeEach(() => {
  mockNext.mockClear();
});

describe("authenticate", () => {
  it("doit appeler next avec une erreur 401 si le header est absent", async () => {
    const req = createMockRequest() as Request;

    await authenticate(req, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("doit appeler next avec une erreur 401 si le header ne commence pas par Bearer", async () => {
    const req = createMockRequest("Basic abc123") as Request;

    await authenticate(req, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("doit appeler next avec une erreur 401 si le token est en blacklist", async () => {
    const req = createMockRequest("Bearer valid.token.here") as Request;
    (redis.get as jest.Mock).mockResolvedValue("1");

    await authenticate(req, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("doit appeler next avec une erreur 401 si le token est invalide", async () => {
    const req = createMockRequest("Bearer invalid.token.here") as Request;
    (redis.get as jest.Mock).mockResolvedValue(null);
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue(null);

    await authenticate(req, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("doit decorer req.user et appeler next sans erreur pour un token valide", async () => {
    const req = createMockRequest("Bearer valid.token.here") as Request;
    (redis.get as jest.Mock).mockResolvedValue(null);
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({
      id: 1,
      email: "test@example.com",
      role: "AUTHOR",
    });

    await authenticate(req, mockResponse, mockNext);

    expect(req.user).toEqual({
      id: 1,
      email: "test@example.com",
      role: "AUTHOR",
    });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("doit continuer si Redis est indisponible", async () => {
    const req = createMockRequest("Bearer valid.token.here") as Request;
    (redis.get as jest.Mock).mockRejectedValue(new Error("Redis down"));
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({
      id: 1,
      email: "test@example.com",
      role: "AUTHOR",
    });

    await authenticate(req, mockResponse, mockNext);

    expect(req.user).toBeDefined();
    expect(mockNext).toHaveBeenCalledWith();
  });
});