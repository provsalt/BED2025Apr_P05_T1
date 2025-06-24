import {useContext, useEffect} from "react";
import {UserContext} from "@/provider/UserContext.js";

export const ChatSideBar = () => {
  const user = useContext(UserContext)
  useEffect(() => {

  }, [user])

  return (
    <div>

    </div>
  )
}