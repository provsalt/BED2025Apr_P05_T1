import { getLoginHistoryByUserId } from "../../models/user/userModel.js";

export const getUserLoginHistoryController = async (req, res) => {
  const userId = req.user.id;

  try {
    const logins = await getLoginHistoryByUserId(userId);
    res.status(200).json(logins);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve login history" });
  }
};
