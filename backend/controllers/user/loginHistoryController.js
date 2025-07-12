import { getLoginHistoryByUserId } from "../../models/user/userModel.js";

export const getUserLoginHistoryController = async (req, res) => {
  const userId = req.user.id;

  try {
    const logins = await getLoginHistoryByUserId(userId);
    // console.log("Raw database login data:", logins);
    // console.log("Sample login_time format:", logins[0]?.login_time);
    // console.log("Sample login_time type:", typeof logins[0]?.login_time);
    res.status(200).json(logins);
  } catch (err) {
    // console.error("Failed to fetch login history:", err);
    res.status(500).json({ error: "Failed to retrieve login history" });
  }
};
