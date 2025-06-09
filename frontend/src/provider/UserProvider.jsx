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
      return null;
    }

    const token = localStorage.getItem("token");
    const parse = decodeJwt(token);
    const isAuthenticated = !!token && parse && parse.exp > Date.now() / 1000;
    setUser({
      id: parse.sub,
      token: token,
      isAuthenticated: isAuthenticated,
    })
  }, [])


  return (
    <UserContext.Provider value={{ ...user }}>
      {children}
    </UserContext.Provider>
  );
};
