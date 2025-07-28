import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

export const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    const newConversation = [...messages, userMessage];
    
    setMessages(newConversation);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetcher('/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: newConversation,
          context: 'general'
        }),
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.response 
      };
      
      setMessages([...newConversation, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages([...newConversation, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (messages.length > 0) {
      setShowCloseDialog(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleConfirmClose = () => {
    setMessages([]);
    setIsOpen(false);
    setShowCloseDialog(false);
  };

  const handleCancelClose = () => {
    setShowCloseDialog(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card 
          className="w-96 h-[500px] absolute bottom-16 right-0 shadow-xl transition-all duration-300 flex flex-col"
        >
          <CardHeader className="p-3 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Support</CardTitle>
              </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleClose}
                >
                  <X className="w-3 h-3" />
                </Button>
            </div>
          </CardHeader>

          {isOpen && (
            <>
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <User className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p>Hi! I'm your assistant.</p>
                      <p>How can I help you today?</p>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <User className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] p-2 rounded-lg text-sm",
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.content}
                      </div>
                      {message.role === 'user' && (
                        <User className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <User className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <div className="bg-muted p-2 rounded-lg text-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-3 border-t flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !inputValue.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      )}

      <Button
        onClick={handleToggleChat}
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Support Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your support history. Are you sure you want to end this support session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};