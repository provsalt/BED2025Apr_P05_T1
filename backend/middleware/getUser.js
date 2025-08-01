import { jwtVerify } from "jose";
import { getUser } from "../models/user/userModel.js";
import { ErrorFactory } from "../utils/AppError.js";

/**
 * Middleware to verify JWT from Authorization header
 * and attach user info to req.user
 */
export const getUserMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw ErrorFactory.unauthorized("Authorization header missing");
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      throw ErrorFactory.validation("Invalid Authorization format. Expected: Bearer <token>");
    }

    const secret = new TextEncoder().encode(process.env.SECRET || "");
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"]
    });

    const user = await getUser(Number(payload.sub));
    if (!user) {
      throw ErrorFactory.unauthorized("User not found or has been deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }

    if (error.code === "ERR_JWT_EXPIRED") {
      return next(ErrorFactory.unauthorized("Token has expired"));
    }

    if (error.code === "ERR_JWT_INVALID") {
      return next(ErrorFactory.unauthorized("Invalid token format"));
    }

    return next(ErrorFactory.unauthorized("Authentication failed"));
  }
};
