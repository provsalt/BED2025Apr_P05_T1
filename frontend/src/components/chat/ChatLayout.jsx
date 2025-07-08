import {Outlet, useParams} from "react-router";
import {ChatSideBar} from "@/components/chat/ChatSideBar.jsx";
import useScreen from "@/hooks/useScreen.js";

export const ChatLayout = () => {
  const {isMobile} = useScreen();
  const {chatId } = useParams();
  return (
    <div className="flex flex-1 pt-2">
      {!isMobile && <ChatSideBar />}
      {isMobile && !chatId && <ChatSideBar />}
      <div className="flex flex-1">
        <Outlet />
      </div>
    </div>
  )
}