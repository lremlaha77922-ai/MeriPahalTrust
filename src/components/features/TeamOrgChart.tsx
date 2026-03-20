import { SwasthaCoordinator } from '@/types';
import { User, Users2, Building2 } from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
  teamMembers: SwasthaCoordinator[];
}

const TeamOrgChart = ({ coordinator, teamMembers }: Props) => {
  // Build hierarchy
  const myTeam = teamMembers.filter(m => m.parent_coordinator_id === coordinator.id);
  
  // Group by type
  const blockCoordinators = myTeam.filter(m => m.coordinator_type === 'block');
  const panchayatCoordinators = myTeam.filter(m => m.coordinator_type === 'panchayat');

  const getIconByType = (type: string) => {
    if (type === 'district') return <Building2 className="h-5 w-5" />;
    if (type === 'block') return <Users2 className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const getColorByType = (type: string) => {
    if (type === 'district') return 'from-purple-500 to-purple-600';
    if (type === 'block') return 'from-blue-500 to-blue-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="space-y-8">
      {/* Current Coordinator */}
      <div className="flex flex-col items-center">
        <div className={`bg-gradient-to-br ${getColorByType(coordinator.coordinator_type)} text-white p-6 rounded-lg shadow-lg max-w-md w-full`}>
          <div className="flex items-center space-x-3 mb-2">
            {getIconByType(coordinator.coordinator_type)}
            <span className="text-sm font-semibold uppercase opacity-90">
              {coordinator.coordinator_type} Coordinator
            </span>
          </div>
          <h3 className="text-xl font-bold">{coordinator.full_name}</h3>
          <p className="text-sm opacity-90 mt-1">
            {coordinator.block_panchayat && `${coordinator.block_panchayat}, `}
            {coordinator.district}, {coordinator.state}
          </p>
          <p className="text-xs opacity-75 mt-2">{coordinator.email}</p>
        </div>
      </div>

      {/* Connecting Line */}
      {myTeam.length > 0 && (
        <div className="flex justify-center">
          <div className="w-0.5 h-12 bg-gray-300"></div>
        </div>
      )}

      {/* Team Members */}
      {coordinator.coordinator_type === 'district' && blockCoordinators.length > 0 && (
        <div>
          <h4 className="text-center text-sm font-semibold text-gray-600 mb-6">
            Block Coordinators ({blockCoordinators.length})
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blockCoordinators.map((member) => (
              <div key={member.id} className="bg-white border-2 border-blue-200 p-4 rounded-lg shadow hover-lift">
                <div className="flex items-center space-x-3 mb-2">
                  {getIconByType(member.coordinator_type)}
                  <span className="text-xs font-semibold text-blue-600 uppercase">
                    Block Coordinator
                  </span>
                </div>
                <h4 className="font-bold text-gray-900">{member.full_name}</h4>
                <p className="text-sm text-gray-600 mt-1">{member.block_panchayat}</p>
                <p className="text-xs text-gray-500">{member.mobile_number}</p>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  Appointed: {new Date(member.appointed_date).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {coordinator.coordinator_type === 'block' && panchayatCoordinators.length > 0 && (
        <div>
          <h4 className="text-center text-sm font-semibold text-gray-600 mb-6">
            Panchayat Coordinators ({panchayatCoordinators.length})
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {panchayatCoordinators.map((member) => (
              <div key={member.id} className="bg-white border-2 border-green-200 p-4 rounded-lg shadow hover-lift">
                <div className="flex items-center space-x-3 mb-2">
                  {getIconByType(member.coordinator_type)}
                  <span className="text-xs font-semibold text-green-600 uppercase">
                    Panchayat Coordinator
                  </span>
                </div>
                <h4 className="font-bold text-gray-900">{member.full_name}</h4>
                <p className="text-sm text-gray-600 mt-1">{member.block_panchayat}</p>
                <p className="text-xs text-gray-500">{member.mobile_number}</p>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  Appointed: {new Date(member.appointed_date).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myTeam.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No team members yet</p>
          <p className="text-sm text-gray-500">Add coordinators to build your team</p>
        </div>
      )}
    </div>
  );
};

export default TeamOrgChart;
