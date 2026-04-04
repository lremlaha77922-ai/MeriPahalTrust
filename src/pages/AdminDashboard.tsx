
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut, Users, UserCheck, UserX, AlertTriangle, FileText, Download, Edit, UserPlus, LayoutDashboard, Wallet, Image, ShoppingBag } from 'lucide-react';
import { Employee, PdfSubmission, Deposit, ProfileEditRequest } from '@/types';
import AddTeamMember from '@/components/features/AddTeamMember';
import AdminGalleryManagement from '@/components/features/AdminGalleryManagement';
import { formatIndianDate, formatIndianTime } from '@/lib/utils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'terminated'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'pdfs' | 'deposits' | 'profile_edits' | 'team' | 'gallery'>('overview');
  const [pdfSubmissions, setPdfSubmissions] = useState<(PdfSubmission & { employee_name: string })[]>([]);
  const [deposits, setDeposits] = useState<(Deposit & { employee_name: string })[]>([]);
  const [profileEditRequests, setProfileEditRequests] = useState<(ProfileEditRequest & { employee_name: string })[]>([]);

  useEffect(() => {
    checkAuth();
    fetchEmployees();
    fetchPdfSubmissions();
    fetchDeposits();
    fetchProfileEditRequests();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin');
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('डेटा लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const fetchPdfSubmissions = async () => {
    try {
      const { data: pdfs, error: pdfError } = await supabase
        .from('pdf_submissions')
        .select('*')
        .order('submission_date', { ascending: false })
        .limit(100);

      if (pdfError) throw pdfError;

      // Fetch employee names
      const employeeIds = [...new Set(pdfs?.map(p => p.employee_id) || [])];
      const { data: employeesData } = await supabase
        .from('employees')
        .select('id, full_name')
        .in('id', employeeIds);

      const employeeMap = new Map(employeesData?.map(e => [e.id, e.full_name]) || []);

      const enrichedPdfs = pdfs?.map(pdf => ({
        ...pdf,
        employee_name: employeeMap.get(pdf.employee_id) || 'अज्ञात',
      })) || [];

      setPdfSubmissions(enrichedPdfs);
    } catch (error: any) {
      console.error('Fetch PDF error:', error);
    }
  };

  const fetchDeposits = async () => {
    try {
      const { data: depositsData, error: depositError } = await supabase
        .from('deposits')
        .select('*')
        .order('deposit_date', { ascending: false })
        .limit(100);

      if (depositError) throw depositError;

      // Fetch employee names
      const employeeIds = [...new Set(depositsData?.map(d => d.employee_id) || [])];
      const { data: employeesData } = await supabase
        .from('employees')
        .select('id, full_name')
        .in('id', employeeIds);

      const employeeMap = new Map(employeesData?.map(e => [e.id, e.full_name]) || []);

      const enrichedDeposits = depositsData?.map(deposit => ({
        ...deposit,
        employee_name: employeeMap.get(deposit.employee_id) || 'अज्ञात',
      })) || [];

      setDeposits(enrichedDeposits);
    } catch (error: any) {
      console.error('Fetch deposits error:', error);
    }
  };

  const fetchProfileEditRequests = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('profile_edit_requests')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(100);

      if (requestsError) throw requestsError;

      // Fetch employee names
      const employeeIds = [...new Set(requestsData?.map(r => r.employee_id) || [])];
      const { data: employeesData } = await supabase
        .from('employees')
        .select('id, full_name')
        .in('id', employeeIds);

      const employeeMap = new Map(employeesData?.map(e => [e.id, e.full_name]) || []);

      const enrichedRequests = requestsData?.map(request => ({
        ...request,
        employee_name: employeeMap.get(request.employee_id) || 'अज्ञात',
      })) || [];

      setProfileEditRequests(enrichedRequests);
    } catch (error: any) {
      console.error('Fetch profile edit requests error:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
    toast.success('लॉगआउट सफल');
  };

  const updateEmployeeStatus = async (id: string, status: 'active' | 'terminated') => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('स्थिति अपडेट की गई');
      fetchEmployees();
      fetchPdfSubmissions();
      fetchDeposits();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('अपडेट विफल');
    }
  };

  const updateDepositStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updateData: any = { status };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deposits')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success(status === 'approved' ? 'जमा राशि स्वीकृत' : 'जमा राशि अस्वीकृत');
      fetchDeposits();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('अपडेट विफल');
    }
  };

  const updateProfileEditRequest = async (requestId: string, employeeId: string, newData: any, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      // Get current user email for logging
      const { data: { user } } = await supabase.auth.getUser();
      const reviewedBy = user?.email || 'Admin';

      // Update request status
      const requestUpdateData: any = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      };

      if (rejectionReason) {
        requestUpdateData.rejection_reason = rejectionReason;
      }

      const { error: requestError } = await supabase
        .from('profile_edit_requests')
        .update(requestUpdateData)
        .eq('id', requestId);

      if (requestError) throw requestError;

      if (status === 'approved') {
        // Update employee data
        const { error: employeeError } = await supabase
          .from('employees')
          .update(newData)
          .eq('id', employeeId);

        if (employeeError) throw employeeError;

        // Log changes in history
        const historyRecords = Object.entries(newData).map(([field, newValue]) => ({
          employee_id: employeeId,
          field_name: field,
          old_value: '', // We can fetch this from old_data if needed
          new_value: String(newValue),
          changed_by: reviewedBy,
          change_type: 'employee_request_approved',
        }));

        const { error: historyError } = await supabase
          .from('profile_change_history')
          .insert(historyRecords);

        if (historyError) console.error('History logging error:', historyError);

        toast.success('प्रोफाइल अपडेट अनुरोध स्वीकृत किया गया');
      } else {
        toast.success('प्रोफाइल अपडेट अनुरोध अस्वीकृत किया गया');
      }

      fetchProfileEditRequests();
      fetchEmployees();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('अपडेट विफल: ' + error.message);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    filter === 'all' ? true : emp.status === filter
  );

  const stats = {
    total: employees.length,
    pending: employees.filter(e => e.status === 'pending').length,
    active: employees.filter(e => e.status === 'active').length,
    terminated: employees.filter(e => e.status === 'terminated').length,
  };

  const pdfStats = {
    total: pdfSubmissions.length,
    onTime: pdfSubmissions.filter(p => !p.is_late).length,
    late: pdfSubmissions.filter(p => p.is_late).length,
    today: pdfSubmissions.filter(p => p.submission_date === new Date().toISOString().split('T')[0]).length,
  };

  const depositStats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === 'pending').length,
    approved: deposits.filter(d => d.status === 'approved').length,
    rejected: deposits.filter(d => d.status === 'rejected').length,
  };

  const profileEditStats = {
    total: profileEditRequests.length,
    pending: profileEditRequests.filter(r => r.status === 'pending').length,
    approved: profileEditRequests.filter(r => r.status === 'approved').length,
    rejected: profileEditRequests.filter(r => r.status === 'rejected').length,
  };

  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      mobile_number: 'मोबाइल नंबर',
      alternate_mobile: 'वैकल्पिक मोबाइल',
      email: 'ईमेल',
      full_address: 'पूरा पता',
      bank_name: 'बैंक का नाम',
      account_number: 'खाता संख्या',
      ifsc_code: 'IFSC कोड',
    };
    return labels[fieldName] || fieldName;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">लोड हो रहा है...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-trust-blue text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">एडमिन डैशबोर्ड</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white text-trust-blue hover:bg-gray-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              लॉगआउट
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            className={activeTab === 'overview' ? 'bg-trust-blue' : ''}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            अवलोकन
          </Button>
          <Button
            onClick={() => setActiveTab('employees')}
            variant={activeTab === 'employees' ? 'default' : 'outline'}
            className={activeTab === 'employees' ? 'bg-trust-blue' : ''}
          >
            <Users className="mr-2 h-4 w-4" />
            कर्मचारी
          </Button>
          <Button
            onClick={() => setActiveTab('pdfs')}
            variant={activeTab === 'pdfs' ? 'default' : 'outline'}
            className={activeTab === 'pdfs' ? 'bg-trust-blue' : ''}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF सबमिशन
          </Button>
          <Button
            onClick={() => setActiveTab('deposits')}
            variant={activeTab === 'deposits' ? 'default' : 'outline'}
            className={activeTab === 'deposits' ? 'bg-trust-blue' : ''}
          >
            <Wallet className="mr-2 h-4 w-4" />
            जमा राशि
          </Button>
          <Button
            onClick={() => setActiveTab('profile_edits')}
            variant={activeTab === 'profile_edits' ? 'default' : 'outline'}
            className={activeTab === 'profile_edits' ? 'bg-trust-blue' : ''}
          >
            <Edit className="mr-2 h-4 w-4" />
            प्रोफाइल अपडेट
          </Button>
          <Button
            onClick={() => setActiveTab('team')}
            variant={activeTab === 'team' ? 'default' : 'outline'}
            className={activeTab === 'team' ? 'bg-trust-blue' : ''}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            टीम जोड़ें
          </Button>
          <Button
            onClick={() => setActiveTab('gallery')}
            variant={activeTab === 'gallery' ? 'default' : 'outline'}
            className={activeTab === 'gallery' ? 'bg-trust-blue' : ''}
          >
            <Image className="mr-2 h-4 w-4" />
            फोटो गैलरी
          </Button>
          <Button
            onClick={() => navigate('/admin/products')}
            variant="outline"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Products
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">कुल कर्मचारी</p>
                    <p className="text-3xl font-bold text-trust-blue">{stats.total}</p>
                  </div>
                  <Users className="h-12 w-12 text-trust-blue" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">सक्रिय</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <UserCheck className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">PDF आज</p>
                    <p className="text-3xl font-bold text-trust-blue">{pdfStats.today}</p>
                  </div>
                  <FileText className="h-12 w-12 text-trust-blue" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">लंबित जमा</p>
                    <p className="text-3xl font-bold text-amber-600">{depositStats.pending}</p>
                  </div>
                  <Wallet className="h-12 w-12 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {activeTab === 'employees' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">कुल कर्मचारी</p>
                <p className="text-3xl font-bold text-trust-blue">{stats.total}</p>
              </div>
              <Users className="h-12 w-12 text-trust-blue" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">लंबित</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">सक्रिय</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">समाप्त</p>
                <p className="text-3xl font-bold text-red-600">{stats.terminated}</p>
              </div>
              <UserX className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>
        )}

        {activeTab === 'pdfs' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">कुल PDF</p>
                <p className="text-3xl font-bold text-trust-blue">{pdfStats.total}</p>
              </div>
              <FileText className="h-12 w-12 text-trust-blue" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">आज की PDF</p>
                <p className="text-3xl font-bold text-green-600">{pdfStats.today}</p>
              </div>
              <FileText className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">समय पर</p>
                <p className="text-3xl font-bold text-green-600">{pdfStats.onTime}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">लेट</p>
                <p className="text-3xl font-bold text-red-600">{pdfStats.late}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>
        )}

        {activeTab === 'deposits' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">कुल जमा</p>
                <p className="text-3xl font-bold text-trust-blue">{depositStats.total}</p>
              </div>
              <Download className="h-12 w-12 text-trust-blue" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">लंबित</p>
                <p className="text-3xl font-bold text-amber-600">{depositStats.pending}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">स्वीकृत</p>
                <p className="text-3xl font-bold text-green-600">{depositStats.approved}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">अस्वीकृत</p>
                <p className="text-3xl font-bold text-red-600">{depositStats.rejected}</p>
              </div>
              <UserX className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>
        )}

        {activeTab === 'profile_edits' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">कुल अनुरोध</p>
                <p className="text-3xl font-bold text-trust-blue">{profileEditStats.total}</p>
              </div>
              <Edit className="h-12 w-12 text-trust-blue" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">लंबित</p>
                <p className="text-3xl font-bold text-amber-600">{profileEditStats.pending}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">स्वीकृत</p>
                <p className="text-3xl font-bold text-green-600">{profileEditStats.approved}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">अस्वीकृत</p>
                <p className="text-3xl font-bold text-red-600">{profileEditStats.rejected}</p>
              </div>
              <UserX className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>
        )}

        {/* Filters */}
        {activeTab === 'employees' && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              className={filter === 'all' ? 'bg-trust-blue' : ''}
            >
              सभी ({stats.total})
            </Button>
            <Button
              onClick={() => setFilter('pending')}
              variant={filter === 'pending' ? 'default' : 'outline'}
              className={filter === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              लंबित ({stats.pending})
            </Button>
            <Button
              onClick={() => setFilter('active')}
              variant={filter === 'active' ? 'default' : 'outline'}
              className={filter === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              सक्रिय ({stats.active})
            </Button>
            <Button
              onClick={() => setFilter('terminated')}
              variant={filter === 'terminated' ? 'default' : 'outline'}
              className={filter === 'terminated' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              समाप्त ({stats.terminated})
            </Button>
          </div>
        </div>
        )}

        {/* Employee Table */}
        {activeTab === 'employees' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    नाम
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    मोबाइल
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    शिक्षा
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    स्थिति
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    कार्य
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                      <div className="text-sm text-gray-500">{employee.father_husband_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.mobile_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.education}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === 'active' ? 'bg-green-100 text-green-800' :
                        employee.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {employee.status === 'active' ? 'सक्रिय' :
                         employee.status === 'pending' ? 'लंबित' : 'समाप्त'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {employee.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateEmployeeStatus(employee.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          स्वीकार करें
                        </Button>
                      )}
                      {employee.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateEmployeeStatus(employee.id, 'terminated')}
                        >
                          समाप्त करें
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">कोई कर्मचारी नहीं मिला</p>
            </div>
          )}
        </div>
        )}

        {/* PDF Submissions Table */}
        {activeTab === 'pdfs' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    कर्मचारी
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    तारीख
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    जमा समय
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    स्थिति
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    कार्य
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pdfSubmissions.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pdf.employee_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatIndianDate(pdf.submission_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatIndianTime(pdf.submitted_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pdf.is_late ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {pdf.is_late ? 'लेट' : 'समय पर'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        onClick={() => window.open(pdf.pdf_url, '_blank')}
                        className="bg-trust-blue hover:bg-blue-800"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        देखें
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pdfSubmissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">कोई PDF सबमिशन नहीं मिला</p>
            </div>
          )}
        </div>
        )}

        {/* Deposits Table */}
        {activeTab === 'deposits' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    कर्मचारी
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    राशि
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    तारीख
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    जमा समय
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    स्थिति
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    कार्य
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deposits.map((deposit) => {
                  const depositDateTime = new Date(deposit.deposit_date + 'T00:00:00');
                  const submittedDateTime = new Date(deposit.submitted_at);
                  const diffHours = (submittedDateTime.getTime() - depositDateTime.getTime()) / (1000 * 60 * 60);
                  const isLate = diffHours > 24;

                  return (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deposit.employee_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{deposit.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatIndianDate(deposit.deposit_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{formatIndianTime(deposit.submitted_at)}</div>
                        {isLate && (
                          <span className="text-xs text-red-600 font-semibold">24 घंटे के बाद</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                          deposit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {deposit.status === 'approved' ? 'स्वीकृत' :
                           deposit.status === 'rejected' ? 'अस्वीकृत' : 'लंबित'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          onClick={() => window.open(deposit.transaction_screenshot_url, '_blank')}
                          className="bg-trust-blue hover:bg-blue-800 mb-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          देखें
                        </Button>
                        {deposit.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateDepositStatus(deposit.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              स्वीकार करें
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateDepositStatus(deposit.id, 'rejected')}
                            >
                              अस्वीकार करें
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {deposits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">कोई जमा रिकॉर्ड नहीं मिला</p>
            </div>
          )}
        </div>
        )}

        {/* Profile Edit Requests Table */}
        {activeTab === 'profile_edits' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    कर्मचारी
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    बदलाव
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    अनुरोध तारीख
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    स्थिति
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    कार्य
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profileEditRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.employee_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        {Object.entries(request.new_data).map(([field, newValue]) => (
                          <div key={field} className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{getFieldLabel(field)}:</span>
                            <span className="text-gray-600 line-through text-xs">{request.old_data[field] || 'खाली'}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-900 font-semibold">{newValue || 'खाली'}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatIndianDate(request.requested_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {request.status === 'approved' ? 'स्वीकृत' :
                         request.status === 'rejected' ? 'अस्वीकृत' : 'लंबित'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateProfileEditRequest(request.id, request.employee_id, request.new_data, 'approved')}
                            className="bg-green-600 hover:bg-green-700 mb-1"
                          >
                            स्वीकार करें
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('अस्वीकृति का कारण दर्ज करें:');
                              if (reason) {
                                updateProfileEditRequest(request.id, request.employee_id, request.new_data, 'rejected', reason);
                              }
                            }}
                          >
                            अस्वीकार करें
                          </Button>
                        </>
                      )}
                      {request.status === 'rejected' && request.rejection_reason && (
                        <div className="text-xs text-red-600">
                          कारण: {request.rejection_reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {profileEditRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">कोई प्रोफाइल अपडेट अनुरोध नहीं मिला</p>
            </div>
          )}
        </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <AddTeamMember />
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <AdminGalleryManagement />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
