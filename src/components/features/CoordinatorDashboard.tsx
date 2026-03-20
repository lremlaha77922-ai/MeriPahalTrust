import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaApplication, SwasthaCoordinator } from '@/types';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Target,
  Award,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  coordinator: SwasthaCoordinator;
}

const CoordinatorDashboard = ({ coordinator }: Props) => {
  const [applications, setApplications] = useState<SwasthaApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [coordinator]);

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from('swastha_applications')
        .select('*');

      // Filter based on coordinator type
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
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    thisMonth: applications.filter(a => {
      const appDate = new Date(a.created_at);
      const now = new Date();
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }).length,
  };

  // Application trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const trendData = last7Days.map(date => {
    const count = applications.filter(a => a.created_at.split('T')[0] === date).length;
    return {
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      applications: count,
    };
  });

  // Status distribution
  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Under Review', value: stats.underReview, color: '#3b82f6' },
  ];

  // Role distribution
  const roleData = Object.entries(
    applications.reduce((acc, app) => {
      const roleLabel = {
        applicant: 'Applicant',
        district_coordinator: 'District',
        block_coordinator: 'Block',
        panchayat_coordinator: 'Panchayat',
      }[app.role] || app.role;
      acc[roleLabel] = (acc[roleLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([role, count]) => ({ role, count }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome, {coordinator.full_name}!</h2>
        <p className="text-pink-100">
          {coordinator.coordinator_type.charAt(0).toUpperCase() + coordinator.coordinator_type.slice(1)} Coordinator 
          - {coordinator.district}, {coordinator.state}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <Users className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Applications</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <Clock className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Pending Review</p>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <CheckCircle className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Approved</p>
          <p className="text-3xl font-bold">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <Activity className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">This Month</p>
          <p className="text-3xl font-bold">{stats.thisMonth}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-pink-600" />
            Application Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-pink-600" />
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role Distribution */}
      {roleData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-pink-600" />
            Applications by Role
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Insights</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Approval Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pending Items</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending + stats.underReview}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Rejection Rate</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
