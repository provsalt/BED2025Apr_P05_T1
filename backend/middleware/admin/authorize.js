import {jwtVerify} from "jose";
import {getAdminById} from "../models/user/adminModel.js";

export const adminAuthorizeMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({"message": "Unauthorized"});
  }
  const data = auth.split(" ");
  if (data[0] !== "Bearer" || data.length !== 2) {
    return res.status(422).json({"message": "Invalid Token"});
  }

  const secret = new TextEncoder().encode(process.env.SECRET || "");
  try {
    const { payload } = await jwtVerify(data[1], secret, {
      algorithm: "HS256",
    });
    if (Date.now() > payload.exp * 1000) {
      return res.status(401).json({"message": "Token Expired"});
    }
    const admin = await getAdminById(Number(payload.sub));
    if (!admin) {
      return res.status(401).json({"message": "Unauthorized"});
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({"message": "Unauthorized"});
  }
}