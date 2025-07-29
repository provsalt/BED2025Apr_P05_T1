import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetcher } from "@/lib/fetcher";

export const Message = ({ 
  children, 
  isSender, 
  messageId, 
  chatId, 
  onMessageUpdated, 
  onMessageDeleted 
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditMessage = async () => {
    if (!editedMessage.trim()) return;
    
    setIsLoading(true);
    try {
      await fetcher(`/chats/${chatId}/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: editedMessage }),
      });
      
      onMessageUpdated?.(messageId, editedMessage);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    setIsLoading(true);
    try {
      await fetcher(`/chats/${chatId}/${messageId}`, {
        method: 'DELETE',
      });
      
      onMessageDeleted?.(messageId);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "max-w-max p-3 px-4 rounded-xl text-white relative group",
        "break-words",
        isSender ? "bg-blue-500 self-end" : "bg-gray-600 self-start",
      )}
    >
      {children}
      
      {isSender && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-6 w-6 p-0"
                onClick={() => setEditedMessage(children)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Message</AlertDialogTitle>
                <AlertDialogDescription>
                  Make changes to your message below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[100px]"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEditMessage}
                  disabled={isLoading || !editedMessage.trim()}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Message</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this message? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteMessage}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};