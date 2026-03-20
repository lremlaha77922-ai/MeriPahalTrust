import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SwasthaApplication, SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MobileQuickReview from '@/components/features/MobileQuickReview';
import MobileQuickChat from '@/components/features/MobileQuickChat';
import MobileQuickReport from '@/components/features/MobileQuickReport';
import {
  LayoutDashboard,
  CheckSquare,
  MessageCircle,
  FileText,
  Bell,
  Settings,
  Loader2,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { isOnline, requestNotificationPermission, showNotification } from '@/lib/pwa';

const MobileCoordinatorApp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'review' | 'chat' | 'report'>('dashboard');
  const [coordinator, setCoordinator] = useState<SwasthaCoordinator | null>(null);
  const [applications, setApplications] = useState<SwasthaApplication[]>([]);
  const [teamMembers, setTeamMembers] = useState<SwasthaCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    checkAuth();
    setupNotifications();
    
    // Online/offline listeners
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
    
    return () => {
      window.removeEventListener('online', () => setOnline(true));
      window.removeEventListener('offline', () => setOnline(false));
    };
  }, []);

  const setupNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      console.log('Notifications enabled');
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('कृपया पहले login करें');
        navigate('/admin');
        return;
      }

      const { data: coordData, error } = await supabase
        .from('swastha_coordinators')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (error || !coordData) {
        toast.error('Coordinator access denied');
        navigate('/');
        return;
      }

      setCoordinator(coordData);
      fetchApplications(coordData);
      fetchTeamMembers(coordData);
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Authentication error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (coord: SwasthaCoordinator) => {
    try {
      let query = supabase
        .from('swastha_applications')
        .select('*')
        .eq('status', 'pending'); // Only pending for quick review

      if (coord.coordinator_type === 'district') {
        query = query.eq('state', coord.state).eq('district', coord.district);
      } else if (coord.coordinator_type === 'block') {
        query = query
          .eq('state', coord.state)
          .eq('district', coord.district)
          .eq('block_panchayat', coord.block_panchayat);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      
      // Show notification if new applications
      if (data && data.length > 0) {
        showNotification('New Applications', {
          body: `${data.length} pending applications waiting for review`,
          tag: 'pending-apps',
        });
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
    }
  };

  const fetchTeamMembers = async (coord: SwasthaCoordinator) => {
    try {
      const { data, error } = await supabase
        .from('swastha_coordinators')
        .select('*')
        .eq('parent_coordinator_id', coord.id)
        .eq('is_active', true);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Fetch team error:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!coordinator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg font-bold">Swastha Coordinator</h1>
            <p className="text-xs text-pink-100">{coordinator.full_name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${online ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-xs font-semibold">{online ? 'Online' : 'Offline'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/20 rounded-lg"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-xs text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-pink-600">{applications.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-xs text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
              <h3 className="font-bold text-gray-900">Quick Actions</h3>
              <Button
                onClick={() => setActiveTab('review')}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white h-12 justify-start"
              >
                <CheckSquare className="h-5 w-5 mr-3" />
                Review Applications ({applications.length})
              </Button>
              <Button
                onClick={() => setActiveTab('chat')}
                variant="outline"
                className="w-full h-12 justify-start"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Team Chat
              </Button>
              <Button
                onClick={() => setActiveTab('report')}
                variant="outline"
                className="w-full h-12 justify-start"
              >
                <FileText className="h-5 w-5 mr-3" />
                Submit Report
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <MobileQuickReview
            applications={applications}
            onUpdate={() => fetchApplications(coordinator)}
          />
        )}

        {activeTab === 'chat' && (
          <MobileQuickChat
            coordinator={coordinator}
            teamMembers={teamMembers}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'report' && (
          <MobileQuickReport
            coordinator={coordinator}
            onSuccess={() => {
              toast.success('Report submitted');
              setActiveTab('dashboard');
            }}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'dashboard' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              activeTab === 'review' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            <span className="text-xs font-semibold">Review</span>
            {applications.length > 0 && (
              <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {applications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'chat' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-semibold">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'report' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs font-semibold">Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCoordinatorApp;
