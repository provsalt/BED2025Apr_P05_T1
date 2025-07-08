import {Avatar} from "@/components/avatar/avatar.jsx";
import {Link} from "react-router";
import { formatDistanceToNow } from 'date-fns';

export const ChatList = ({ conversations, selectedChatId, onSelectChat }) => {
  return (
    <div className="w-full max-w-sm bg-gray-50 space-y-2">
      <div className="flex flex-col gap-2">
        {conversations.map((chat) => (
          <Link to={`/chats/${chat.id}`} key={chat.id}>
            <div
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center gap-3 p-4 cursor-pointer rounded-lg transition-colors ${
                selectedChatId === chat.id ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <Avatar username={chat.username} size={48} />
              <div className="min-w-0">
                <div className="font-semibold truncate">@{chat.username}</div>
                <div className="text-gray-500 text-sm truncate">
                  {chat.lastMessage}
                </div>
                <div className="text-xs text-gray-400">
                  {chat.lastMessageTime && formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
