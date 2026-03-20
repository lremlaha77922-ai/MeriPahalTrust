import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaAnnouncement, SwasthaCoordinator } from '@/types';
import { Bell, AlertCircle, Info, Calendar, Megaphone } from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
}

const CoordinatorAnnouncements = ({ coordinator }: Props) => {
  const [announcements, setAnnouncements] = useState<SwasthaAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [coordinator]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_announcements')
        .select('*')
        .eq('is_active', true)
        .or(`target_audience.eq.all,target_audience.eq.${coordinator.coordinator_type}`)
        .or(`target_state.is.null,target_state.eq.${coordinator.state}`)
        .or(`target_district.is.null,target_district.eq.${coordinator.district}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Fetch announcements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    low: 'bg-gray-100 border-gray-300 text-gray-800',
    normal: 'bg-blue-50 border-blue-300 text-blue-800',
    high: 'bg-amber-50 border-amber-300 text-amber-800',
    urgent: 'bg-red-50 border-red-300 text-red-800',
  };

  const typeIcons = {
    general: <Info className="h-5 w-5" />,
    urgent: <AlertCircle className="h-5 w-5" />,
    training: <Calendar className="h-5 w-5" />,
    event: <Megaphone className="h-5 w-5" />,
    policy_update: <Bell className="h-5 w-5" />,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Communication Center</h2>
            <p className="text-indigo-100">Important announcements and updates</p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No announcements at this time
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white border-l-4 rounded-lg shadow-md p-6 ${priorityColors[announcement.priority]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    announcement.priority === 'urgent' ? 'bg-red-100' :
                    announcement.priority === 'high' ? 'bg-amber-100' :
                    announcement.priority === 'normal' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {typeIcons[announcement.announcement_type]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                    <p className="text-xs text-gray-600 capitalize">
                      {announcement.announcement_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  announcement.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                  announcement.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {announcement.priority.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-line">{announcement.message}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Posted by: {announcement.created_by}</span>
                <span>{new Date(announcement.created_at).toLocaleString('en-IN')}</span>
              </div>

              {announcement.expires_at && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Expires: {new Date(announcement.expires_at).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> सभी announcements को ध्यान से पढ़ें और महत्वपूर्ण सूचनाओं पर तुरंत कार्रवाई करें। 
          Urgent announcements पर विशेष ध्यान दें।
        </p>
      </div>
    </div>
  );
};

export default CoordinatorAnnouncements;
