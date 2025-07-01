import {useParams} from "react-router";
import {ChatContent} from "@/components/chat/ChatContent.jsx";

export const SelectedChat = () => {
  const { chatId} = useParams()

  return (
    <ChatContent chatId={chatId} />
  )
}