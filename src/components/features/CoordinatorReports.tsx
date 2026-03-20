import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaReport, SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Clock,
  Calendar,
  Plus,
  Eye
} from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
}

const CoordinatorReports = ({ coordinator }: Props) => {
  const [reports, setReports] = useState<SwasthaReport[]>([]);
  const [showNewReport, setShowNewReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    report_type: 'monthly',
    report_period: '',
    total_applications: 0,
    approved_count: 0,
    rejected_count: 0,
    pending_count: 0,
    activities_conducted: 0,
    beneficiaries_reached: 0,
    challenges_faced: '',
    achievements: '',
    recommendations: '',
  });

  useEffect(() => {
    fetchReports();
  }, [coordinator]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_reports')
        .select('*')
        .eq('coordinator_id', coordinator.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Fetch reports error:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['total_applications', 'approved_count', 'rejected_count', 'pending_count', 'activities_conducted', 'beneficiaries_reached'].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('swastha_reports')
        .insert([
          {
            coordinator_id: coordinator.id,
            ...formData,
          },
        ]);

      if (error) throw error;

      toast.success('Report submitted successfully');
      setShowNewReport(false);
      fetchReports();
      
      // Reset form
      setFormData({
        report_type: 'monthly',
        report_period: '',
        total_applications: 0,
        approved_count: 0,
        rejected_count: 0,
        pending_count: 0,
        activities_conducted: 0,
        beneficiaries_reached: 0,
        challenges_faced: '',
        achievements: '',
        recommendations: '',
      });
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Report submission में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    reviewed: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Reporting Tools</h2>
          <p className="text-green-100">Submit your activity reports and track submissions</p>
        </div>
        <Button
          onClick={() => setShowNewReport(!showNewReport)}
          className="bg-white text-green-600 hover:bg-green-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* New Report Form */}
      {showNewReport && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Submit New Report</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="report_type">Report Type *</Label>
              <select
                id="report_type"
                name="report_type"
                value={formData.report_type}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="special">Special</option>
              </select>
            </div>

            <div>
              <Label htmlFor="report_period">Report Period *</Label>
              <Input
                id="report_period"
                name="report_period"
                value={formData.report_period}
                onChange={handleInputChange}
                placeholder="e.g., January 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="total_applications">Total Applications</Label>
              <Input
                id="total_applications"
                name="total_applications"
                type="number"
                min="0"
                value={formData.total_applications}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="approved_count">Approved</Label>
              <Input
                id="approved_count"
                name="approved_count"
                type="number"
                min="0"
                value={formData.approved_count}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="rejected_count">Rejected</Label>
              <Input
                id="rejected_count"
                name="rejected_count"
                type="number"
                min="0"
                value={formData.rejected_count}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="pending_count">Pending</Label>
              <Input
                id="pending_count"
                name="pending_count"
                type="number"
                min="0"
                value={formData.pending_count}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="activities_conducted">Activities Conducted</Label>
              <Input
                id="activities_conducted"
                name="activities_conducted"
                type="number"
                min="0"
                value={formData.activities_conducted}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="beneficiaries_reached">Beneficiaries Reached</Label>
              <Input
                id="beneficiaries_reached"
                name="beneficiaries_reached"
                type="number"
                min="0"
                value={formData.beneficiaries_reached}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea
                id="achievements"
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                rows={3}
                placeholder="Key achievements during this period..."
              />
            </div>

            <div>
              <Label htmlFor="challenges_faced">Challenges Faced</Label>
              <Textarea
                id="challenges_faced"
                name="challenges_faced"
                value={formData.challenges_faced}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any challenges or issues encountered..."
              />
            </div>

            <div>
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                name="recommendations"
                value={formData.recommendations}
                onChange={handleInputChange}
                rows={3}
                placeholder="Suggestions for improvement..."
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowNewReport(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Submitted Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Applications</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Activities</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No reports submitted yet
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                      {report.report_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.report_period}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.total_applications}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.activities_conducted}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[report.status]}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(report.submitted_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorReports;
