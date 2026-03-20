import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SwasthaApplication, SwasthaCoordinator, SwasthaSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import SwasthaAnalytics from '@/components/features/SwasthaAnalytics';
import SwasthaApplicationDetail from '@/components/features/SwasthaApplicationDetail';
import AdminCoordinatorSearch from '@/components/features/AdminCoordinatorSearch';
import { downloadCSV, formatApplicationForCSV } from '@/lib/csvExport';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Settings,
  BarChart3,
  FileText,
  LogOut,
  Loader2,
  UserSearch,
} from 'lucide-react';

const SwasthaSanginiAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'applications' | 'analytics' | 'coordinators' | 'search' | 'settings'>('applications');
  const [applications, setApplications] = useState<SwasthaApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<SwasthaApplication[]>([]);
  const [coordinators, setCoordinators] = useState<SwasthaCoordinator[]>([]);
  const [settings, setSettings] = useState<SwasthaSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<SwasthaApplication | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  // Admin auth check (basic - can be enhanced)
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('कृपया पहले login करें');
      navigate('/admin');
      return;
    }
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from('swastha_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);
      setFilteredApplications(appsData || []);

      // Fetch coordinators
      const { data: coordsData, error: coordsError } = await supabase
        .from('swastha_coordinators')
        .select('*')
        .order('appointed_date', { ascending: false });

      if (coordsError) throw coordsError;
      setCoordinators(coordsData || []);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('swastha_settings')
        .select('*');

      if (settingsError) throw settingsError;
      setSettings(settingsData || []);

    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('डेटा लोड करने में त्रुटि');
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
        app.whatsapp_number.includes(searchTerm) ||
        app.gmail_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(app => app.role === roleFilter);
    }

    if (stateFilter !== 'all') {
      filtered = filtered.filter(app => app.state === stateFilter);
    }

    if (districtFilter !== 'all') {
      filtered = filtered.filter(app => app.district === districtFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, roleFilter, stateFilter, districtFilter, applications]);

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get the application details
      const application = applications.find(app => app.id === id);
      if (!application) {
        toast.error('Application not found');
        return;
      }

      // Update application status
      const { error: updateError } = await supabase
        .from('swastha_applications')
        .update({
          status: 'approved',
          reviewed_by: user?.email || 'Admin',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Create coordinator record (Coordinator ID will be auto-generated by trigger)
      if (application.role !== 'applicant') {
        const coordinatorType = application.role.replace('_coordinator', '');
        
        const { data: newCoordinator, error: coordError } = await supabase
          .from('swastha_coordinators')
          .insert({
            application_id: id,
            coordinator_type: coordinatorType,
            full_name: application.full_name,
            state: application.state,
            district: application.district,
            block_panchayat: application.block_panchayat,
            pincode: application.pincode,
            mobile_number: application.whatsapp_number,
            email: application.gmail_id,
            photo_url: application.photo_url,
            upi_id: application.upi_id,
            is_active: true,
          })
          .select()
          .single();

        if (coordError) throw coordError;

        toast.success(`Application approved! Coordinator ID: ${newCoordinator.coordinator_id}`);
      } else {
        toast.success('Application approved successfully');
      }

      fetchData();
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error('Approval में त्रुटि: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('swastha_applications')
        .update({
          status: 'rejected',
          reviewed_by: user?.email || 'Admin',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Application rejected');
      fetchData();
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error('Rejection में त्रुटि');
    }
  };

  const handleExportCSV = () => {
    const formattedData = formatApplicationForCSV(filteredApplications);
    downloadCSV(formattedData, 'swastha_sangini_applications');
    toast.success('CSV exported successfully');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('swastha_settings')
        .update({
          setting_value: value,
          updated_by: user?.email || 'Admin',
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', key);

      if (error) throw error;

      toast.success('Setting updated successfully');
      fetchData();
    } catch (error: any) {
      console.error('Update setting error:', error);
      toast.error('Setting update में त्रुटि');
    }
  };

  // Get unique states and districts for filters
  const uniqueStates = [...new Set(applications.map(app => app.state))].sort();
  const uniqueDistricts = [...new Set(applications.map(app => app.district))].sort();

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
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
              <h1 className="text-3xl font-bold">स्वस्थ संगिनी Admin Panel</h1>
              <p className="text-pink-100">Application Management System</p>
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
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'applications'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <FileText className="inline h-5 w-5 mr-2" />
              Applications
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'analytics'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <BarChart3 className="inline h-5 w-5 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('coordinators')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'coordinators'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <Users className="inline h-5 w-5 mr-2" />
              Coordinators
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'search'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <UserSearch className="inline h-5 w-5 mr-2" />
              Search
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-pink-600'
              }`}
            >
              <Settings className="inline h-5 w-5 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search by name, ID, phone, email..."
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
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">State</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">District</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Applied Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.application_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{app.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{roleLabels[app.role]}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{app.state}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{app.district}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <SwasthaAnalytics />}

        {/* Coordinators Tab */}
        {activeTab === 'coordinators' && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointed Coordinators</h2>
              {coordinators.length === 0 ? (
                <p className="text-gray-600">No coordinators appointed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Coordinator ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Appointed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {coordinators.map((coord) => (
                        <tr key={coord.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-md bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-300">
                              <span className="text-sm font-bold text-pink-900">{coord.coordinator_id || 'Generating...'}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{coord.full_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold uppercase">
                              {coord.coordinator_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>{coord.district}, {coord.state}</div>
                            {coord.block_panchayat && <div className="text-xs text-gray-500">{coord.block_panchayat}</div>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>{coord.mobile_number}</div>
                            <div className="text-xs text-gray-500">{coord.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              coord.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {coord.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(coord.appointed_date).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && <AdminCoordinatorSearch />}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Settings</h2>
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="border-b pb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {setting.setting_label}
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        defaultValue={setting.setting_value}
                        onBlur={(e) => {
                          if (e.target.value !== setting.setting_value) {
                            handleUpdateSetting(setting.setting_key, e.target.value);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                    {setting.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(setting.updated_at).toLocaleString('en-IN')}
                        {setting.updated_by && ` by ${setting.updated_by}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <SwasthaApplicationDetail
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default SwasthaSanginiAdmin;
