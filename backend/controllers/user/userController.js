import {createUser, getUserByEmail} from "../../models/user/userModel.js";
import {User} from "../../utils/validation/user.js";
import {SignJWT} from "jose";
import {z} from "zod/v4";
import bcrypt from "bcryptjs";

export const getCurrentUserController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }
  res.status(200).json(req.user)
}

export const loginUserController = async (req, res) => {
  const body = req.body;
  const validate = z.object({
    email: z.email().max(255),
    password: z.string().min(12).max(255).regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter").regex(/(?=.*[!@#$%^&*()])/, "Password must contain at least one special character"),
  }).safeParse(body)
  if (!validate.success) {
    return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
  }

  const user = await getUserByEmail(validate.data.email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(validate.data.password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const secret = new TextEncoder().encode(process.env.SECRET || "");
  const tok = await new SignJWT({
    sub: user.id
  }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
  res.status(200).json({
    id: user.id,
    token: tok
  });
}

export const createUserController = async (req, res) => {
    const body = req.body;

    const validate = User.safeParse(body);

    if (!validate.success) {
        return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
    }
    try {
        const newUser = await createUser(validate.data);
        const secret = new TextEncoder().encode(process.env.SECRET || "");
        const tok = await new SignJWT({
          sub: newUser.id
        }).setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("1d")
          .sign(secret);
        res.status(201).json({
          id: newUser.id,
          token: tok
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error creating user" });
    }
}