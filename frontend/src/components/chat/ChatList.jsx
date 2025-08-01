import { Avatar } from "@/components/avatar/avatar.jsx";
import { Link } from "react-router";
import { formatDistanceToNow } from 'date-fns';

export const ChatList = ({ conversations, selectedChatId, onSelectChat }) => {
  return (
    <div className="w-full max-w-sm bg-muted space-y-2">
      <div className="flex flex-col gap-2">
        {conversations.map((chat) => (
          <Link to={`/chats/${chat.id}`} key={chat.id}>
            <div
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center gap-3 p-4 cursor-pointer rounded-lg transition-colors ${
                selectedChatId === chat.id ? "bg-muted/80" : "hover:bg-muted/50"
              }`}
            >
              {chat.profile_picture_url ? (
                <img
                  src={chat.profile_picture_url}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <Avatar username={chat.name} size={48} />
              )}
              <div className="min-w-0">
                <div className="font-semibold truncate">{chat.name}</div>
                <div className="text-muted-foreground text-sm truncate">
                  {chat.lastMessage}
                </div>
                <div className="text-xs text-muted-foreground/70">
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
