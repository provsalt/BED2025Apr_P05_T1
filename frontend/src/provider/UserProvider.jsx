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
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof localStorage === "undefined") {
      setIsLoading(false);
      return;
    }

    // Check for token in URL parameters (Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.setItem("token", urlToken);
    }

    const token = urlToken || localStorage.getItem("token");
    const parse = token ? decodeJwt(token) : null;
    if (!parse) {
      setIsLoading(false);
      return;
    }
    const isAuthenticated = !!token && parse && (Date.now() / 10000 ) < parse.exp;
    if (!isAuthenticated) {
      setUser(undefined);
      setIsLoading(false);
      localStorage.removeItem("token");
      return;
    }

    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`).then(data => {
      setUser({
        id: parse.sub,
        token,
        role: parse.role,
        isAuthenticated: true,
        data: {
          name: data.name || "",
          email: data.email || "",
          language: data.language || "",
          profile_picture_url: data.profile_picture_url || "",
        }
      })
    }).finally(() => {
      setIsLoading(false);
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
      });
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`);

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
    <UserContext.Provider value={{ ...user, isLoading, setUser: updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
