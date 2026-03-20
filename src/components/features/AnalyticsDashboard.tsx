import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AttendanceRecord, SurveyRecord, PdfSubmission, Deposit } from '@/types';
import {
  calculateAttendancePercentage,
  calculateSurveyCompletionRate,
  calculatePdfPunctualityScore,
  calculateDepositCompliance,
  calculateOverallScore,
  getPerformanceBadge,
  generateSuggestions,
  getWeeklyTrend,
  getMonthlyTrend,
} from '@/lib/analytics';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Target, Lightbulb, Calendar, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
  employeeId: string;
}

const AnalyticsDashboard = ({ employeeId }: AnalyticsDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [surveyRecords, setSurveyRecords] = useState<SurveyRecord[]>([]);
  const [pdfSubmissions, setPdfSubmissions] = useState<PdfSubmission[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchAllData();
  }, [employeeId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];

      // Fetch attendance records
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('attendance_date', dateFilter)
        .order('attendance_date', { ascending: true });

      // Fetch survey records
      const { data: surveyData } = await supabase
        .from('survey_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('survey_date', dateFilter)
        .order('survey_date', { ascending: true });

      // Fetch PDF submissions
      const { data: pdfData } = await supabase
        .from('pdf_submissions')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('submission_date', dateFilter)
        .order('submission_date', { ascending: true });

      // Fetch deposits
      const { data: depositData } = await supabase
        .from('deposits')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('deposit_date', dateFilter)
        .order('deposit_date', { ascending: true });

      setAttendanceRecords(attendanceData || []);
      setSurveyRecords(surveyData || []);
      setPdfSubmissions(pdfData || []);
      setDeposits(depositData || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">डेटा लोड हो रहा है...</div>
      </div>
    );
  }

  // Calculate metrics
  const attendancePercentage = calculateAttendancePercentage(attendanceRecords);
  const surveyRate = calculateSurveyCompletionRate(surveyRecords);
  const pdfScore = calculatePdfPunctualityScore(pdfSubmissions);
  const depositCompliance = calculateDepositCompliance(deposits);
  const overallScore = calculateOverallScore(attendancePercentage, surveyRate, pdfScore, depositCompliance);
  const badge = getPerformanceBadge(overallScore);
  const suggestions = generateSuggestions(attendancePercentage, surveyRate, pdfScore, depositCompliance);

  // Prepare chart data
  const performanceData = [
    { name: 'उपस्थिति', value: attendancePercentage, color: '#3b82f6' },
    { name: 'सर्वे', value: surveyRate, color: '#10b981' },
    { name: 'PDF पंचुअलिटी', value: pdfScore, color: '#f59e0b' },
    { name: 'जमा अनुपालन', value: depositCompliance, color: '#8b5cf6' },
  ];

  const trendData = viewMode === 'weekly' 
    ? getWeeklyTrend(pdfSubmissions, 'submission_date')
    : getMonthlyTrend(pdfSubmissions, 'submission_date');

  const surveyTrendData = viewMode === 'weekly'
    ? getWeeklyTrend(surveyRecords, 'survey_date')
    : getMonthlyTrend(surveyRecords, 'survey_date');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Performance Badge */}
      <div className={`${badge.color} text-white p-8 rounded-2xl shadow-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-5xl">{badge.icon}</span>
              <h2 className="text-3xl font-bold">{badge.title}</h2>
            </div>
            <p className="text-white/90 text-lg">{badge.description}</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">समग्र स्कोर</p>
            <p className="text-6xl font-bold">{overallScore}%</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            <span className="text-3xl font-bold text-blue-600">{attendancePercentage}%</span>
          </div>
          <p className="text-gray-600 font-semibold">उपस्थिति दर</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-green-500" />
            <span className="text-3xl font-bold text-green-600">{surveyRate}%</span>
          </div>
          <p className="text-gray-600 font-semibold">सर्वे पूर्णता</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${surveyRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-amber-500" />
            <span className="text-3xl font-bold text-amber-600">{pdfScore}%</span>
          </div>
          <p className="text-gray-600 font-semibold">PDF पंचुअलिटी</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pdfScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-purple-500" />
            <span className="text-3xl font-bold text-purple-600">{depositCompliance}%</span>
          </div>
          <p className="text-gray-600 font-semibold">जमा अनुपालन</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${depositCompliance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trend View Toggle */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-trust-blue" />
            प्रदर्शन ट्रेंड
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-trust-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              साप्ताहिक
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-trust-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              मासिक
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Comparison - Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">प्रदर्शन तुलना</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Overall Performance - Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">सभी मेट्रिक्स</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PDF Submission Trend */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            PDF सबमिशन ट्रेंड ({viewMode === 'weekly' ? 'साप्ताहिक' : 'मासिक'})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viewMode === 'weekly' ? 'week' : 'month'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="PDF जमा" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Survey Trend */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            सर्वे ट्रेंड ({viewMode === 'weekly' ? 'साप्ताहिक' : 'मासिक'})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={surveyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viewMode === 'weekly' ? 'week' : 'month'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="सर्वे पूर्ण" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personalized Suggestions */}
      <div className="bg-gradient-to-r from-trust-lightblue to-blue-50 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="h-6 w-6 mr-2 text-amber-500" />
          आपके लिए सुझाव
        </h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-trust-blue"
            >
              <p className="text-gray-800">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-2xl font-bold text-gray-900">{surveyRecords.reduce((sum, r) => sum + r.survey_count, 0)}</p>
          <p className="text-gray-600">कुल सर्वे पूर्ण</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-2xl font-bold text-gray-900">{pdfSubmissions.length}</p>
          <p className="text-gray-600">PDF अपलोड</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-2xl font-bold text-gray-900">₹{deposits.reduce((sum, d) => sum + Number(d.amount), 0).toFixed(2)}</p>
          <p className="text-gray-600">कुल जमा राशि</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
