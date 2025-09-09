import bcrypt from "bcryptjs";
import userRepository from "../repositories/user.repository";
import jwtUtils from "../utils/jwt";
import AppError from "../utils/AppError";
import redis from "../config/redis";

// enregistrement de nouvel user avec hashage du mot de passe
const registerUser = async (data: {
  email: string;
  password: string;
  username: string;
}) => {
  const existingUser = await userRepository.findUserByEmailSafe(data.email);
  if (existingUser) {
    throw new AppError("Un utilisateur avec cet email existe deja", 409);
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  const user = await userRepository.createUser({
    email: data.email,
    password: hashedPassword,
    username: data.username,
  });

  const token = jwtUtils.generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

// verification des credentials et generation d un token pour le login
const loginUser = async (data: { email: string; password: string }) => {
  const user = await userRepository.findUserByEmail(data.email);
  if (!user) {
    throw new AppError("Email ou mot de passe incorrect", 401);
  }

  let isPasswordValid = false;

  try {
    isPasswordValid = await bcrypt.compare(data.password, user.password);
  } catch {
    throw new AppError("Email ou mot de passe incorrect", 401);
  }

  if (!isPasswordValid) {
    throw new AppError("Email ou mot de passe incorrect", 401);
  }

  const token = jwtUtils.generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

// invalidation du token lorsqu'on le place en blacklist Redis jusqu'a son expiration
const logoutUser = async (token: string): Promise<void> => {
  const ttl = jwtUtils.getTokenRemainingTTL(token);

  // si le token est deja expire on ne le stocke pas en Redis
  if (ttl <= 0) return;

  await redis.set(`blacklist:${token}`, "1", "EX", ttl);
};

export default { registerUser, loginUser, logoutUser };