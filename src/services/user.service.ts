import bcrypt from "bcryptjs";
import userRepository from "../repositories/user.repository";
import jwtUtils from "../utils/jwt";
import AppError from "../utils/AppError";

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

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Email ou mot de passe incorrect", 401);
  }

  const token = jwtUtils.generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // on ne retourne pas le mot de passe dans la reponse
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export default {
  registerUser,
  loginUser,
};