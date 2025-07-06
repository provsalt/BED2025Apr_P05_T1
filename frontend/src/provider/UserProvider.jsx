import { useEffect, useState} from "react";
import {decodeJwt} from "jose";
import {UserContext} from "@/provider/UserContext.js";
import {fetcher} from "@/lib/fetcher.js";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    token: null,
    isAuthenticated: false,
    name: "",
    profile_picture_url: ""
  });

  useEffect(() => {

    if (typeof localStorage === "undefined") {
      return;
    }

    const token = localStorage.getItem("token");
    const parse = token ? decodeJwt(token) : null;
    if (!parse) {
      return;
    }
    
    const isExpired = parse.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem("token");
      setUser({ id: null, token: null, isAuthenticated: false });
      return;
    }
    
    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/${parse.sub}`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(data => {
        setUser({
          id: parse.sub,
          token: token,
          isAuthenticated: true,
          profile_picture_url: data.profile_picture_url || "",
          name: data.name || "",
        })
    })
  }, [])


  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
    
    if (newUserData.token) {
      localStorage.setItem("token", newUserData.token);
    }
    
  if (newUserData.isAuthenticated === false) {
    localStorage.removeItem("token");
    setUser({
      id: null,
      token: null,
      isAuthenticated: false,
      name: "",
      profile_picture_url: ""
    });
    return;
  }
  };

const refreshUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser((prev) => ({
      ...prev,
      profile_picture_url: res.profile_picture_url || "",
      name: res.name || "",
    }));
  } catch (err) {
    console.error("Failed to refresh user:", err);
  }
};

  return (
    <UserContext.Provider value={{ ...user, setUser: updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};