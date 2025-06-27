import {Outlet} from "react-router";
import {ChatSideBar} from "@/components/chat/ChatSideBar.jsx";

export const ChatLayout = () => {

  return (
    <div className="flex flex-1 pt-2">
      <ChatSideBar />
      <Outlet />
    </div>
  )
}