import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator, SwasthaTeamMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Send, ArrowLeft } from 'lucide-react';
import { isOnline, saveOfflineData } from '@/lib/pwa';

interface Props {
  coordinator: SwasthaCoordinator;
  teamMembers: SwasthaCoordinator[];
  onBack?: () => void;
}

const MobileQuickChat = ({ coordinator, teamMembers, onBack }: Props) => {
  const [messages, setMessages] = useState<SwasthaTeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [coordinator]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_team_messages')
        .select('*')
        .or(`sender_id.eq.${coordinator.id},recipient_id.eq.${coordinator.id}`)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender_id: coordinator.id,
      recipient_id: null,
      message_type: 'team_broadcast' as const,
      subject: 'Quick Message',
      message: newMessage,
      priority: 'normal' as const,
    };

    setLoading(true);

    try {
      if (isOnline()) {
        // Send to all team members
        const messagePromises = teamMembers.map(member =>
          supabase.from('swastha_team_messages').insert([
            { ...messageData, recipient_id: member.id }
          ])
        );
        await Promise.all(messagePromises);
        toast.success('Message sent');
      } else {
        // Save offline
        await saveOfflineData('pending_messages', messageData);
        toast.info('Message saved. Will send when online.');
      }

      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      console.error('Send error:', error);
      toast.error('Message send करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 flex items-center space-x-3">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1">
          <h3 className="font-bold">Team Chat</h3>
          <p className="text-xs text-teal-100">{teamMembers.length} members</p>
        </div>
        <div className={`h-2 w-2 rounded-full ${isOnline() ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === coordinator.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMine
                    ? 'bg-pink-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                {!isMine && (
                  <p className="text-xs font-semibold mb-1 opacity-75">Team Member</p>
                )}
                <p className="text-sm whitespace-pre-line">{msg.message}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-pink-100' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-gray-50 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MobileQuickChat;
