import {createUser, getUser} from "../../models/user/userModel.js";
import {User} from "../../utils/validation/user.js";
import {SignJWT} from "jose";

export const getCurrentUserController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }
  res.status(200).json(req.user)
}

// export const getUserController = async (req, res) => {
//     const userId = parseInt(req.params.id);
//     if (isNaN(userId)) {
//         return res.status(400).json({ error: "Invalid user ID" });
//     }
//
//     try {
//         const user = await getUser(userId);
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }
//         res.json(user);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching user" });
//     }
// }

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