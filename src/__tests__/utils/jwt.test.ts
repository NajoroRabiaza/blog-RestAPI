import jwtUtils, { TokenPayload } from "../../utils/jwt";

const mockPayload: TokenPayload = {
  id: 1,
  email: "test@example.com",
  role: "AUTHOR",
};

describe("generateToken", () => {
  it("doit generer un token JWT valide", () => {
    const token = jwtUtils.generateToken(mockPayload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });
});

describe("verifyToken", () => {
  it("doit retourner le payload pour un token valide", () => {
    const token = jwtUtils.generateToken(mockPayload);
    const decoded = jwtUtils.verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(mockPayload.id);
    expect(decoded?.email).toBe(mockPayload.email);
    expect(decoded?.role).toBe(mockPayload.role);
  });

  it("doit retourner null pour un token invalide", () => {
    const result = jwtUtils.verifyToken("token.invalide.ici");
    expect(result).toBeNull();
  });

  it("doit retourner null pour un token vide", () => {
    const result = jwtUtils.verifyToken("");
    expect(result).toBeNull();
  });
});

describe("getTokenRemainingTTL", () => {
  it("doit retourner un TTL positif pour un token valide", () => {
    const token = jwtUtils.generateToken(mockPayload);
    const ttl = jwtUtils.getTokenRemainingTTL(token);
    expect(ttl).toBeGreaterThan(0);
  });

  it("doit retourner 0 pour un token invalide", () => {
    const ttl = jwtUtils.getTokenRemainingTTL("token.invalide.ici");
    expect(ttl).toBe(0);
  });
});