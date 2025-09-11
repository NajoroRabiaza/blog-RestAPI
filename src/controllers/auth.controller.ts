import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// inscription d'un nouvel utilisateur
const register: AsyncController = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const result = await userService.registerUser({ email, password, username });

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// connexion d'un utilisateur existant
const login: AsyncController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser({ email, password });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// deconnexion et invalidation du token en blacklist Redis
const logout: AsyncController = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(400).json({
        status: "fail",
        message: "Token manquant",
      });
      return;
    }

    await userService.logoutUser(token);

    res.status(200).json({
      status: "success",
      message: "Deconnexion reussie",
    });
  } catch (err) {
    next(err);
  }
};

export default { register, login, logout };