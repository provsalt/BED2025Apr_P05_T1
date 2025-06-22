import {jwtVerify} from "jose";
import {getUser} from "../models/user/userModel.js";

export const getUserMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({"message": "Unauthorized"});
  }
  const data = auth.split(" ")
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
    const user = await getUser(Number(payload.sub));
    if (!user) {
      return res.status(401).json({"message": "Unauthorized"});
    }
    req.user = user;
    next();
  }
  catch (error) {
    console.log(error)
    return res.status(401).json({"message": "Unauthorized"});
  }
}