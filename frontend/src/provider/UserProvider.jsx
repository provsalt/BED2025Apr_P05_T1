import { useEffect, useState} from "react";
import {decodeJwt} from "jose";
import {UserContext} from "@/provider/UserContext.js";
import {fetcher} from "@/lib/fetcher.js";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    token: null,
    isAuthenticated: false,
    role: null,
    data: null,
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
    const isAuthenticated = !!token && parse && parse.exp > (Date.now() / 1000);
    if (!isAuthenticated) {
      setUser(undefined)
      localStorage.removeItem("token");
      return;
    }

    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/${parse.sub}`).then(data => {
      setUser({
        id: parse.sub,
        token,
        isAuthenticated: true,
        role: parse.role, 
        data: {
          name: data.name || "",
          email: data.email || "",
          language: data.language || "",
          profile_picture_url: data.profile_picture_url || "",
        }
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
        role: null,
        data: null,
        profile_picture_url: ""
      });
    }
  };

const refreshUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user`);

  setUser((prev) => ({
    ...prev,
    data: {
      ...prev.data,
      name: res.name || "",
      email: res.email || "",
      language: res.language || "",
      profile_picture_url: res.profile_picture_url || "",
    },
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