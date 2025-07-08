import { jwtVerify } from "jose";
import { getUser } from "../models/user/userModel.js";

/**
 * Middleware to verify JWT from Authorization header
 * and attach user info to req.user
 */
export const getUserMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(422).json({ message: "Invalid Authorization format" });
  }

  try {
    const secret = new TextEncoder().encode(process.env.SECRET || "");
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"]
    });

    if (Date.now() > payload.exp * 1000) {
      return res.status(401).json({ message: "Token Expired" });
    }

    const user = await getUser(Number(payload.sub));
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
