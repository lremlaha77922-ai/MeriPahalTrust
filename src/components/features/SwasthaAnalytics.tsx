import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaApplication } from '@/types';
import { Users, CheckCircle, XCircle, Clock, TrendingUp, MapPin, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SwasthaAnalytics = () => {
  const [applications, setApplications] = useState<SwasthaApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
  };

  // Applications by state
  const stateData = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.state] = (acc[app.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Applications by role
  const roleData = Object.entries(
    applications.reduce((acc, app) => {
      const roleLabel = {
        applicant: 'Applicant',
        district_coordinator: 'District Coordinator',
        block_coordinator: 'Block Coordinator',
        panchayat_coordinator: 'Panchayat Coordinator',
      }[app.role] || app.role;
      acc[roleLabel] = (acc[roleLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([role, count]) => ({ role, count }));

  // Status distribution
  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Under Review', value: stats.underReview, color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <Users className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Applications</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <Clock className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <CheckCircle className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Approved</p>
          <p className="text-3xl font-bold">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <XCircle className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Rejected</p>
          <p className="text-3xl font-bold">{stats.rejected}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg hover-lift">
          <TrendingUp className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Under Review</p>
          <p className="text-3xl font-bold">{stats.underReview}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-pink-600" />
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
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

        {/* Applications by Role */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-pink-600" />
            Applications by Role
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 States */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-pink-600" />
          Top 10 States by Applications
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stateData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="state" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SwasthaAnalytics;
