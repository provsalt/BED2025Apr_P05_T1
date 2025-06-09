import {useContext} from "react";
import {UserContext} from "@/provider/UserContext.js";

export const Home = () => {
  const auth = useContext(UserContext);
    return (
        <>
          <p>
            Hello world
          </p>
          Logged in as: {auth.id ? auth.id : "Not logged in"}
        </>
    )
}