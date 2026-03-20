import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaApplication, SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SwasthaApplicationDetail from './SwasthaApplicationDetail';
import { Search, Filter, Eye, Calendar, MapPin } from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
}

const CoordinatorApplicants = ({ coordinator }: Props) => {
  const [applications, setApplications] = useState<SwasthaApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<SwasthaApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<SwasthaApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, [coordinator]);

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from('swastha_applications')
        .select('*');

      // Filter based on coordinator jurisdiction
      if (coordinator.coordinator_type === 'district') {
        query = query.eq('state', coordinator.state).eq('district', coordinator.district);
      } else if (coordinator.coordinator_type === 'block') {
        query = query
          .eq('state', coordinator.state)
          .eq('district', coordinator.district)
          .eq('block_panchayat', coordinator.block_panchayat);
      } else if (coordinator.coordinator_type === 'panchayat') {
        query = query
          .eq('state', coordinator.state)
          .eq('district', coordinator.district)
          .eq('block_panchayat', coordinator.block_panchayat);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      setFilteredApplications(data || []);
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.whatsapp_number.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(app => app.role === roleFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, roleFilter, applications]);

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    under_review: 'bg-blue-100 text-blue-800',
  };

  const roleLabels = {
    applicant: 'Applicant',
    district_coordinator: 'District Coordinator',
    block_coordinator: 'Block Coordinator',
    panchayat_coordinator: 'Panchayat Coordinator',
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
      {/* Jurisdiction Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded flex items-start space-x-3">
        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">Your Jurisdiction</p>
          <p className="text-gray-700">
            {coordinator.coordinator_type.charAt(0).toUpperCase() + coordinator.coordinator_type.slice(1)} Level
            {' - '}
            {coordinator.block_panchayat && `${coordinator.block_panchayat}, `}
            {coordinator.district}, {coordinator.state}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="under_review">Under Review</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Roles</option>
            <option value="applicant">Applicant</option>
            <option value="district_coordinator">District Coordinator</option>
            <option value="block_coordinator">Block Coordinator</option>
            <option value="panchayat_coordinator">Panchayat Coordinator</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Application ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Applied Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.application_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{app.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{roleLabels[app.role]}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {app.block_panchayat && `${app.block_panchayat}, `}
                      {app.district}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(app.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        onClick={() => setSelectedApplication(app)}
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <SwasthaApplicationDetail
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={() => {}}
          onReject={() => {}}
        />
      )}
    </div>
  );
};

export default CoordinatorApplicants;
