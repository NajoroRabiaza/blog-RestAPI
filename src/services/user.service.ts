import bcrypt from "bcryptjs";
import userRepository from "../repositories/user.repository";
import jwtUtils from "../utils/jwt";
import AppError from "../utils/AppError";

// enregistrement du nouvel utilisateur avec hashage du mot de passe
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

export default {
  registerUser,
};