import { cn } from "@/lib/utils";

export const Message = ({ children, isSender }) => {
  return (
    <div
      className={cn(
        "max-w-max p-3 px-4 rounded-xl text-white",
        "break-words",
        isSender ? "bg-blue-500 self-end" : "bg-gray-600 self-start",
      )}
    >
      {children}
    </div>
  );
};