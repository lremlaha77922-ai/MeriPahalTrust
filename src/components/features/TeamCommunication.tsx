import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator, SwasthaTeamMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Mail, Users, MessageCircle, AlertCircle } from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
  teamMembers: SwasthaCoordinator[];
}

const TeamCommunication = ({ coordinator, teamMembers }: Props) => {
  const [messages, setMessages] = useState<SwasthaTeamMessage[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    message_type: 'team_broadcast' as 'direct' | 'team_broadcast' | 'announcement',
    recipient_id: '',
    subject: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });

  useEffect(() => {
    fetchMessages();
  }, [coordinator]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_team_messages')
        .select('*')
        .or(`sender_id.eq.${coordinator.id},recipient_id.eq.${coordinator.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.subject || !formData.message) {
        toast.error('Subject और message required हैं');
        setLoading(false);
        return;
      }

      if (formData.message_type === 'direct' && !formData.recipient_id) {
        toast.error('कृपया recipient select करें');
        setLoading(false);
        return;
      }

      // Send message to team or individual
      if (formData.message_type === 'team_broadcast') {
        // Send to all team members
        const messagePromises = teamMembers.map(member =>
          supabase.from('swastha_team_messages').insert([
            {
              sender_id: coordinator.id,
              recipient_id: member.id,
              message_type: formData.message_type,
              subject: formData.subject,
              message: formData.message,
              priority: formData.priority,
            },
          ])
        );
        await Promise.all(messagePromises);
      } else {
        // Send to single recipient
        const { error } = await supabase
          .from('swastha_team_messages')
          .insert([
            {
              sender_id: coordinator.id,
              recipient_id: formData.recipient_id || null,
              message_type: formData.message_type,
              subject: formData.subject,
              message: formData.message,
              priority: formData.priority,
            },
          ]);

        if (error) throw error;
      }

      toast.success('Message sent successfully');
      setShowCompose(false);
      fetchMessages();
      
      // Reset form
      setFormData({
        message_type: 'team_broadcast',
        recipient_id: '',
        subject: '',
        message: '',
        priority: 'normal',
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error('Message send करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-amber-100 text-amber-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Team Communication</h2>
          <p className="text-teal-100">Send messages and announcements to your team</p>
        </div>
        <Button
          onClick={() => setShowCompose(!showCompose)}
          className="bg-white text-teal-600 hover:bg-teal-50"
        >
          <Send className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      {/* Compose Message */}
      {showCompose && (
        <form onSubmit={handleSend} className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Compose Message</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="message_type">Message Type *</Label>
              <select
                id="message_type"
                name="message_type"
                value={formData.message_type}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="team_broadcast">Team Broadcast</option>
                <option value="direct">Direct Message</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            {formData.message_type === 'direct' && (
              <div>
                <Label htmlFor="recipient_id">Recipient *</Label>
                <select
                  id="recipient_id"
                  name="recipient_id"
                  value={formData.recipient_id}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select recipient</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} - {member.block_panchayat || member.district}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={formData.message_type === 'direct' ? '' : 'md:col-span-2'}>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Message subject"
              required
            />
          </div>

          <div className="mt-6">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowCompose(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Message History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-bold text-gray-900">{msg.subject}</h4>
                      <p className="text-xs text-gray-500">
                        {msg.sender_id === coordinator.id ? 'Sent' : 'Received'} •{' '}
                        {new Date(msg.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[msg.priority]}`}>
                    {msg.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 ml-8 whitespace-pre-line">{msg.message}</p>
                <div className="ml-8 mt-2 text-xs text-gray-500 capitalize">
                  Type: {msg.message_type.replace('_', ' ')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCommunication;
