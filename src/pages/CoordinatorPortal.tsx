import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CoordinatorDashboard from '@/components/features/CoordinatorDashboard';
import CoordinatorApplicants from '@/components/features/CoordinatorApplicants';
import CoordinatorResources from '@/components/features/CoordinatorResources';
import CoordinatorReports from '@/components/features/CoordinatorReports';
import CoordinatorAnnouncements from '@/components/features/CoordinatorAnnouncements';
import CoordinatorTeamManagement from '@/components/features/CoordinatorTeamManagement';
import CoordinatorProfile from '@/components/features/CoordinatorProfile';
import SurveyForm from '@/components/features/SurveyForm';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Bell,
  LogOut,
  Loader2,
  UsersRound,
  UserCircle,
  ClipboardList,
} from 'lucide-react';

const CoordinatorPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'surveys' | 'applicants' | 'resources' | 'reports' | 'announcements' | 'team'>('dashboard');
  const [coordinator, setCoordinator] = useState<SwasthaCoordinator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('कृपया पहले login करें');
        navigate('/admin');
        return;
      }

      // Fetch coordinator data
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
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Authentication error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading coordinator portal...</p>
        </div>
      </div>
    );
  }

  if (!coordinator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">Coordinator not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Coordinator Portal</h1>
              <p className="text-pink-100">स्वस्थ संगिनी कार्ड Management System</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/20 border-white text-white hover:bg-white hover:text-pink-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <LayoutDashboard className="inline h-5 w-5 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <UserCircle className="inline h-5 w-5 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('surveys')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'surveys'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <ClipboardList className="inline h-5 w-5 mr-2" />
              Surveys
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'applicants'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <Users className="inline h-5 w-5 mr-2" />
              Applicants
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <BookOpen className="inline h-5 w-5 mr-2" />
              Resources
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <FileText className="inline h-5 w-5 mr-2" />
              Reports
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'announcements'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <Bell className="inline h-5 w-5 mr-2" />
              Announcements
            </button>
            {(coordinator.coordinator_type === 'district' || coordinator.coordinator_type === 'block') && (
              <button
                onClick={() => setActiveTab('team')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'team'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-600 hover:text-pink-600'
                }`}
              >
                <UsersRound className="inline h-5 w-5 mr-2" />
                Team
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <CoordinatorDashboard coordinator={coordinator} />}
        {activeTab === 'profile' && <CoordinatorProfile coordinator={coordinator} onUpdate={checkAuth} />}
        {activeTab === 'surveys' && <SurveyForm coordinator={coordinator} onSuccess={() => toast.success('Survey submitted!')} />}
        {activeTab === 'applicants' && <CoordinatorApplicants coordinator={coordinator} />}
        {activeTab === 'resources' && <CoordinatorResources coordinator={coordinator} />}
        {activeTab === 'reports' && <CoordinatorReports coordinator={coordinator} />}
        {activeTab === 'announcements' && <CoordinatorAnnouncements coordinator={coordinator} />}
        {activeTab === 'team' && <CoordinatorTeamManagement coordinator={coordinator} />}
      </div>
    </div>
  );
};

export default CoordinatorPortal;
