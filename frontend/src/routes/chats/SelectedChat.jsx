import {useParams} from "react-router";

export const SelectedChat = () => {
  const { chatId} = useParams()

  return (
    <div>
      <h1>{chatId}</h1>
    </div>
  )
}