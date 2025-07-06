import {createContext} from "react";

export const UserContext = createContext({
  id: null,
  token: null,
  isAuthenticated: false,
  profile_picture_url: ""
});