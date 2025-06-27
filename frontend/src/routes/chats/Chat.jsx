import {ChatWelcome} from "@/components/chat/ChatWelcome.jsx";
import useScreen from "@/hooks/useScreen.js";

export const Chat = () => {
  const { isMobile} = useScreen();
  if (!isMobile) {
    return <ChatWelcome />;
  }
}