import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const TeamChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat messages from localStorage
    const savedMessages = localStorage.getItem('teamChatMessages');

    const initializeMockMessages = () => {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          sender: 'Priya Sharma',
          message: 'Hey team! Should we meet tomorrow to discuss the project architecture?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isCurrentUser: false
        },
        {
          id: '2',
          sender: 'You',
          message: 'That sounds great! I\'m available after 3 PM.',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          isCurrentUser: true
        },
        {
          id: '3',
          sender: 'Rahul Verma',
          message: 'I can join at 4 PM. Should I prepare the ML model presentation?',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          isCurrentUser: false
        },
        {
          id: '4',
          sender: 'Sneha Patel',
          message: 'I\'ll work on the database schema. Will share the design by EOD.',
          timestamp: new Date(Date.now() - 2500000).toISOString(),
          isCurrentUser: false
        }
      ];
      setMessages(mockMessages);
      localStorage.setItem('teamChatMessages', JSON.stringify(mockMessages));
    };

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error parsing chat messages:', e);
        initializeMockMessages();
      }
    } else {
      initializeMockMessages();
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveMessages = (updatedMessages: ChatMessage[]) => {
    setMessages(updatedMessages);
    localStorage.setItem('teamChatMessages', JSON.stringify(updatedMessages));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isCurrentUser: true
    };

    saveMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={msg.isCurrentUser ? 'bg-primary text-white' : 'bg-secondary text-white'}>
                    {msg.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${msg.isCurrentUser
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Smile className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-primary to-primary/80 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamChat;
