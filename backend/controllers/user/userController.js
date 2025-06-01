import {createUser, getUser} from "../../models/user/userModel.js";
import {User} from "../../utils/validation/user.js";

export const getUserController = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user" });
    }
}

export const createUserController = async (req, res) => {
    const body = req.body;


    const validate = User.safeParse(body);

    if (!validate.success) {
        return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
    }
    try {
        const newUser = await createUser(validate.data);
        res.status(201).json(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error creating user" });
    }
}