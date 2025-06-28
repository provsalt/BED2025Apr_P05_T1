import {createAdmin, getAdminById} from "../../models/user/adminModel.js";
import {SignJWT} from "jose";

export const getCurrentAdminController = async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({"message": "Unauthorized"});
  }
  res.status(200).json(req.admin);
}

export const createAdminController = async (req, res) => {
  try {
    const adminData = req.body;
    if (!adminData.name || !adminData.email || !adminData.password || !adminData.dob) {
      return res.status(422).json({"message": "Invalid data"});
    }
    const newAdmin = await createAdmin(adminData);
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({"message": "Internal Server Error"});
  }
}

export const loginAdminController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({"message": "Invalid data"});
    }
    
    const admin = await getAdminById(email);
    if (!admin || !(await bcrypt.compare(password, admin.hashedPassword))) {
      return res.status(401).json({"message": "Invalid credentials"});
    }

    const jwt = await new SignJWT({ sub: admin.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(new TextEncoder().encode(process.env.SECRET || ""));
    
    res.status(200).json({ token: jwt });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({"message": "Internal Server Error"});
  }
}
