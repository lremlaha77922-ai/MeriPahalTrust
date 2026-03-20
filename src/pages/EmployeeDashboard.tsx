import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LogOut, User, FileText, Calendar, BarChart3, Camera, Edit2, History } from 'lucide-react';
import { Employee } from '@/types';
import PdfUpload from '@/components/features/PdfUpload';
import PdfHistory from '@/components/features/PdfHistory';
import DepositSubmission from '@/components/features/DepositSubmission';
import DepositHistory from '@/components/features/DepositHistory';
import AnalyticsDashboard from '@/components/features/AnalyticsDashboard';
import PhotoUpload from '@/components/features/PhotoUpload';
import ProfileEdit from '@/components/features/ProfileEdit';
import ChangeHistory from '@/components/features/ChangeHistory';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [depositRefresh, setDepositRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<'pdf' | 'deposit' | 'analytics' | 'profile' | 'edit' | 'history'>('pdf');
  const [photoRefresh, setPhotoRefresh] = useState(0);

  useEffect(() => {
    checkAuthAndFetchEmployee();
  }, []);

  const checkAuthAndFetchEmployee = async () => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin');
        return;
      }

      // Fetch employee data
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Fetch error:', error);
        toast.error('कर्मचारी डेटा नहीं मिला');
        return;
      }

      if (data.status !== 'active') {
        toast.error('आपका अकाउंट सक्रिय नहीं है');
        await supabase.auth.signOut();
        navigate('/admin');
        return;
      }

      setEmployee(data);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast.success('लॉगआउट सफल');
  };

  const handleUploadSuccess = () => {
    setRefreshCounter(prev => prev + 1);
  };

  const handleDepositSuccess = () => {
    setDepositRefresh(prev => prev + 1);
  };

  const handlePhotoUploadSuccess = (photoUrl: string) => {
    setPhotoRefresh(prev => prev + 1);
    if (employee) {
      setEmployee({ ...employee, photo_url: photoUrl });
    }
    checkAuthAndFetchEmployee();
  };

  const handleProfileUpdateSuccess = () => {
    checkAuthAndFetchEmployee();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">लोड हो रहा है...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">कर्मचारी डेटा नहीं मिला</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-trust-blue text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">कर्मचारी डैशबोर्ड</h1>
              <p className="text-gray-100 mt-1">स्वागत है, {employee.full_name}</p>
            </div>
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
        {/* Employee Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-start space-x-4">
            {employee.photo_url ? (
              <img
                src={employee.photo_url}
                alt={employee.full_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-trust-lightblue rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-trust-blue" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{employee.full_name}</h2>
              <p className="text-gray-600">{employee.father_husband_name}</p>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">मोबाइल</p>
                  <p className="font-semibold text-gray-900">{employee.mobile_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">शिक्षा</p>
                  <p className="font-semibold text-gray-900">{employee.education}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">स्थिति</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    सक्रिय
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">चेतावनियाँ</p>
                  <p className={`font-semibold ${
                    employee.warning_count >= 3 ? 'text-red-600' :
                    employee.warning_count > 0 ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {employee.warning_count} / 3
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
            <FileText className="h-10 w-10 mb-3 opacity-80" />
            <p className="text-sm opacity-90">आज की PDF</p>
            <p className="text-3xl font-bold">जमा करें</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
            <Calendar className="h-10 w-10 mb-3 opacity-80" />
            <p className="text-sm opacity-90">मासिक लक्ष्य</p>
            <p className="text-3xl font-bold">306 सर्वे</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-lg shadow-md">
            <User className="h-10 w-10 mb-3 opacity-80" />
            <p className="text-sm opacity-90">आपकी स्थिति</p>
            <p className="text-3xl font-bold">उत्कृष्ट</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex space-x-4 flex-wrap gap-2">
          <Button
            onClick={() => setActiveTab('pdf')}
            variant={activeTab === 'pdf' ? 'default' : 'outline'}
            className={activeTab === 'pdf' ? 'bg-trust-blue' : ''}
          >
            <FileText className="mr-2 h-4 w-4" />
            दैनिक PDF अपलोड
          </Button>
          <Button
            onClick={() => setActiveTab('deposit')}
            variant={activeTab === 'deposit' ? 'default' : 'outline'}
            className={activeTab === 'deposit' ? 'bg-trust-blue' : ''}
          >
            <User className="mr-2 h-4 w-4" />
            जमा राशि
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            className={activeTab === 'analytics' ? 'bg-trust-blue' : ''}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            प्रदर्शन विश्लेषण
          </Button>
          <Button
            onClick={() => setActiveTab('profile')}
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            className={activeTab === 'profile' ? 'bg-trust-blue' : ''}
          >
            <Camera className="mr-2 h-4 w-4" />
            प्रोफाइल फोटो
          </Button>
          <Button
            onClick={() => setActiveTab('edit')}
            variant={activeTab === 'edit' ? 'default' : 'outline'}
            className={activeTab === 'edit' ? 'bg-trust-blue' : ''}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            प्रोफाइल संपादित करें
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className={activeTab === 'history' ? 'bg-trust-blue' : ''}
          >
            <History className="mr-2 h-4 w-4" />
            बदलाव इतिहास
          </Button>
        </div>

        {/* Main Content */}
        {activeTab === 'pdf' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* PDF Upload */}
            <div>
              <PdfUpload 
                employeeId={employee.id}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>

            {/* PDF History */}
            <div>
              <PdfHistory 
                employeeId={employee.id}
                refresh={refreshCounter}
              />
            </div>
          </div>
        )}

        {activeTab === 'deposit' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Deposit Submission */}
            <div>
              <DepositSubmission 
                employeeId={employee.id}
                onSubmitSuccess={handleDepositSuccess}
              />
            </div>

            {/* Deposit History */}
            <div>
              <DepositHistory 
                employeeId={employee.id}
                refresh={depositRefresh}
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard employeeId={employee.id} />
        )}

        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto">
            <PhotoUpload
              employeeId={employee.id}
              currentPhotoUrl={employee.photo_url}
              onUploadSuccess={handlePhotoUploadSuccess}
            />
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="max-w-4xl mx-auto">
            <ProfileEdit
              employee={employee}
              onUpdateSuccess={handleProfileUpdateSuccess}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <ChangeHistory employeeId={employee.id} />
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-8 bg-amber-50 border-l-4 border-trust-gold p-6 rounded-r-lg">
          <h3 className="font-bold text-gray-900 mb-2">महत्वपूर्ण सूचना</h3>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li className="flex items-start">
              <span className="text-trust-blue mr-2">•</span>
              <span>प्रतिदिन 6:00 AM - 7:00 AM के बीच PDF जमा करना अनिवार्य है</span>
            </li>
            <li className="flex items-start">
              <span className="text-trust-blue mr-2">•</span>
              <span>लेट सबमिशन पर चेतावनी दी जा सकती है</span>
            </li>
            <li className="flex items-start">
              <span className="text-trust-blue mr-2">•</span>
              <span>3 चेतावनियों पर सेवा समाप्ति हो सकती है</span>
            </li>
            <li className="flex items-start">
              <span className="text-trust-blue mr-2">•</span>
              <span>अधिक जानकारी के लिए Guidelines पेज देखें</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
