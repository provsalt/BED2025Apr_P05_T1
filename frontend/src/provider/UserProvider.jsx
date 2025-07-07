import { useEffect, useState} from "react";
import {decodeJwt} from "jose";
import {UserContext} from "@/provider/UserContext.js";


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    token: null,
    isAuthenticated: false,
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
    const isAuthenticated = !!token && parse && parse.exp < Date.now() / 1000;
    if (isAuthenticated) {
      setUser(undefined)
      return;
    }
    setUser({
      id: parse.sub,
      token: token,
      isAuthenticated: isAuthenticated,
    })
  }, [])


  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
    
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
