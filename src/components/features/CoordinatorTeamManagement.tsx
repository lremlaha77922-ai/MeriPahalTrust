import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import TeamOrgChart from './TeamOrgChart';
import AddTeamMember from './AddTeamMember';
import TeamPerformance from './TeamPerformance';
import TeamCommunication from './TeamCommunication';
import { Users, Plus, TrendingUp, MessageSquare, Network } from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
}

const CoordinatorTeamManagement = ({ coordinator }: Props) => {
  const [teamMembers, setTeamMembers] = useState<SwasthaCoordinator[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [activeView, setActiveView] = useState<'chart' | 'performance' | 'communication'>('chart');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, [coordinator]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_coordinators')
        .select('*')
        .eq('parent_coordinator_id', coordinator.id)
        .eq('is_active', true)
        .order('appointed_date', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Fetch team members error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddMember(false);
    fetchTeamMembers();
  };

  // Check if this coordinator can add team members
  const canAddMembers = coordinator.coordinator_type === 'district' || coordinator.coordinator_type === 'block';

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
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Team Management</h2>
            <p className="text-violet-100">
              Manage your {coordinator.coordinator_type === 'district' ? 'Block' : 'Panchayat'} Coordinators
            </p>
          </div>
          {canAddMembers && (
            <Button
              onClick={() => setShowAddMember(true)}
              className="bg-white text-violet-600 hover:bg-violet-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Coordinator
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
        <button
          onClick={() => setActiveView('chart')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            activeView === 'chart'
              ? 'bg-violet-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Network className="inline h-5 w-5 mr-2" />
          Org Chart
        </button>
        <button
          onClick={() => setActiveView('performance')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            activeView === 'performance'
              ? 'bg-violet-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="inline h-5 w-5 mr-2" />
          Performance
        </button>
        <button
          onClick={() => setActiveView('communication')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            activeView === 'communication'
              ? 'bg-violet-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="inline h-5 w-5 mr-2" />
          Communication
        </button>
      </div>

      {/* Content */}
      {activeView === 'chart' && <TeamOrgChart coordinator={coordinator} teamMembers={teamMembers} />}
      {activeView === 'performance' && <TeamPerformance coordinator={coordinator} teamMembers={teamMembers} />}
      {activeView === 'communication' && <TeamCommunication coordinator={coordinator} teamMembers={teamMembers} />}

      {/* Add Member Modal */}
      {showAddMember && (
        <AddTeamMember
          coordinator={coordinator}
          onSuccess={handleAddSuccess}
          onCancel={() => setShowAddMember(false)}
        />
      )}
    </div>
  );
};

export default CoordinatorTeamManagement;
