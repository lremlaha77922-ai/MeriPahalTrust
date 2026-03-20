import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Deposit } from '@/types';
import { IndianRupee, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { formatIndianDate, formatIndianTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DepositHistoryProps {
  employeeId: string;
  refresh: number;
}

const DepositHistory = ({ employeeId, refresh }: DepositHistoryProps) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();
  }, [employeeId, refresh]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('employee_id', employeeId)
        .order('deposit_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setDeposits(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'bg-green-100 text-green-800 border-green-300',
          text: 'स्वीकृत',
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5" />,
          color: 'bg-red-100 text-red-800 border-red-300',
          text: 'अस्वीकृत',
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          text: 'लंबित',
        };
    }
  };

  const calculateDeadlineStatus = (depositDate: string, submittedAt: string) => {
    const depositDateTime = new Date(depositDate + 'T00:00:00');
    const submittedDateTime = new Date(submittedAt);
    const diffHours = (submittedDateTime.getTime() - depositDateTime.getTime()) / (1000 * 60 * 60);
    
    return diffHours <= 24;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-gray-500">लोड हो रहा है...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <IndianRupee className="mr-2 h-6 w-6 text-trust-blue" />
        पेमेंट इतिहास
      </h2>

      {deposits.length === 0 ? (
        <div className="text-center py-12">
          <IndianRupee className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">कोई जमा रिकॉर्ड नहीं मिला</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deposits.map((deposit) => {
            const statusBadge = getStatusBadge(deposit.status);
            const isOnTime = calculateDeadlineStatus(deposit.deposit_date, deposit.submitted_at);

            return (
              <div
                key={deposit.id}
                className={`border rounded-lg p-4 ${statusBadge.color.replace('text-', 'border-').split(' ')[0].replace('bg-', 'border-')}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{deposit.amount.toFixed(2)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${statusBadge.color} border`}>
                        {statusBadge.icon}
                        <span>{statusBadge.text}</span>
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>
                        <strong>तारीख:</strong> {formatIndianDate(deposit.deposit_date)}
                      </p>
                      <p className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>सबमिट समय: {formatIndianTime(deposit.submitted_at)}</span>
                        {!isOnTime && (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-semibold flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            24 घंटे के बाद
                          </span>
                        )}
                      </p>
                      {deposit.approved_at && (
                        <p className="text-green-700">
                          <strong>स्वीकृत:</strong> {formatIndianTime(deposit.approved_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  {deposit.transaction_screenshot_url && (
                    <Button
                      size="sm"
                      onClick={() => window.open(deposit.transaction_screenshot_url, '_blank')}
                      className="bg-trust-blue hover:bg-blue-800"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      देखें
                    </Button>
                  )}
                </div>

                {/* Status Message */}
                {deposit.status === 'approved' && (
                  <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded">
                    <p className="text-sm text-green-800">
                      ✓ आपकी जमा राशि स्वीकार कर ली गई है।
                    </p>
                  </div>
                )}
                {deposit.status === 'rejected' && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
                    <p className="text-sm text-red-800">
                      ✗ आपकी जमा राशि अस्वीकार कर दी गई है। कृपया एडमिन से संपर्क करें।
                    </p>
                  </div>
                )}
                {deposit.status === 'pending' && (
                  <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded">
                    <p className="text-sm text-amber-800">
                      ⏳ स्वीकृति की प्रतीक्षा में। कृपया धैर्य रखें।
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {deposits.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-trust-blue">
                {deposits.filter(d => d.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">स्वीकृत</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {deposits.filter(d => d.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">लंबित</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {deposits.filter(d => d.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">अस्वीकृत</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositHistory;
