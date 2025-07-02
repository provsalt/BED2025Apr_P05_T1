import { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import { UserContext } from "@/provider/UserContext.js";
import axios from "axios";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const parsed = decodeJwt(token);
      const isExpired = parsed.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        return;
      }

      axios.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setUser({
          id: parsed.sub,
          token,
          isAuthenticated: true,
          name: res.data.name || ""
        });
      })
      .catch((err) => {
        console.error("Failed to fetch user name", err);
      });
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }, []);

  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
    if (newUserData.token) {
      localStorage.setItem("token", newUserData.token);
    }
    if (newUserData.isAuthenticated === false) {
      localStorage.removeItem("token");
    }
  };

  return (
    <UserContext.Provider value={{ ...user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
