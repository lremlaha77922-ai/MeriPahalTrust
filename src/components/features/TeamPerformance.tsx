import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator, SwasthaReport } from '@/types';
import { Award, TrendingUp, Target, Activity, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  coordinator: SwasthaCoordinator;
  teamMembers: SwasthaCoordinator[];
}

interface MemberPerformance {
  member: SwasthaCoordinator;
  totalApplications: number;
  approvedApplications: number;
  activitiesConducted: number;
  beneficiariesReached: number;
  approvalRate: number;
  lastReportDate?: string;
}

const TeamPerformance = ({ coordinator, teamMembers }: Props) => {
  const [performance, setPerformance] = useState<MemberPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, [teamMembers]);

  const fetchPerformance = async () => {
    try {
      const performanceData: MemberPerformance[] = [];

      for (const member of teamMembers) {
        // Fetch applications under this member's jurisdiction
        let appQuery = supabase
          .from('swastha_applications')
          .select('*')
          .eq('state', member.state)
          .eq('district', member.district);

        if (member.block_panchayat) {
          appQuery = appQuery.eq('block_panchayat', member.block_panchayat);
        }

        const { data: apps } = await appQuery;

        // Fetch reports from this member
        const { data: reports } = await supabase
          .from('swastha_reports')
          .select('*')
          .eq('coordinator_id', member.id)
          .order('submitted_at', { ascending: false });

        const totalActivities = reports?.reduce((sum, r) => sum + (r.activities_conducted || 0), 0) || 0;
        const totalBeneficiaries = reports?.reduce((sum, r) => sum + (r.beneficiaries_reached || 0), 0) || 0;
        const approvedApps = apps?.filter(a => a.status === 'approved').length || 0;
        const totalApps = apps?.length || 0;

        performanceData.push({
          member,
          totalApplications: totalApps,
          approvedApplications: approvedApps,
          activitiesConducted: totalActivities,
          beneficiariesReached: totalBeneficiaries,
          approvalRate: totalApps > 0 ? (approvedApps / totalApps) * 100 : 0,
          lastReportDate: reports?.[0]?.submitted_at,
        });
      }

      // Sort by approval rate
      performanceData.sort((a, b) => b.approvalRate - a.approvalRate);
      setPerformance(performanceData);
    } catch (error) {
      console.error('Fetch performance error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const chartData = performance.map(p => ({
    name: p.member.full_name.split(' ')[0],
    applications: p.totalApplications,
    approved: p.approvedApplications,
    activities: p.activitiesConducted,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (performance.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="h-8 w-8" />
          <h3 className="text-2xl font-bold">Top Performers</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {performance.slice(0, 3).map((p, idx) => (
            <div key={p.member.id} className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">#{idx + 1}</span>
                <Star className="h-6 w-6" fill="currentColor" />
              </div>
              <h4 className="font-bold text-lg">{p.member.full_name}</h4>
              <p className="text-sm opacity-90">{p.member.block_panchayat || p.member.district}</p>
              <div className="mt-3 pt-3 border-t border-white/30">
                <p className="text-sm">Approval Rate: <span className="font-bold">{p.approvalRate.toFixed(1)}%</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-pink-600" />
          Team Performance Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="applications" fill="#3b82f6" name="Total Applications" />
            <Bar dataKey="approved" fill="#10b981" name="Approved" />
            <Bar dataKey="activities" fill="#f59e0b" name="Activities" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900">Detailed Performance Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Coordinator</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Applications</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Approval Rate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Activities</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beneficiaries</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performance.map((p) => (
                <tr key={p.member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{p.member.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {p.member.block_panchayat || p.member.district}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{p.totalApplications}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-semibold">{p.approvedApplications}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${p.approvalRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {p.approvalRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.activitiesConducted}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.beneficiariesReached}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {p.lastReportDate
                      ? new Date(p.lastReportDate).toLocaleDateString('en-IN')
                      : 'No reports'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformance;
