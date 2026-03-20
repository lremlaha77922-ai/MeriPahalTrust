import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileChangeHistory, ProfileEditRequest } from '@/types';
import { History, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatIndianDate, formatIndianTime } from '@/lib/utils';

interface ChangeHistoryProps {
  employeeId: string;
}

const ChangeHistory = ({ employeeId }: ChangeHistoryProps) => {
  const [history, setHistory] = useState<ProfileChangeHistory[]>([]);
  const [requests, setRequests] = useState<ProfileEditRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [employeeId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch change history
      const { data: historyData, error: historyError } = await supabase
        .from('profile_change_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('changed_at', { ascending: false })
        .limit(50);

      if (historyError) throw historyError;

      // Fetch all edit requests (including rejected)
      const { data: requestsData, error: requestsError } = await supabase
        .from('profile_edit_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('requested_at', { ascending: false })
        .limit(50);

      if (requestsError) throw requestsError;

      setHistory(historyData || []);
      setRequests(requestsData || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-300';
      case 'rejected':
        return 'bg-red-50 border-red-300';
      default:
        return 'bg-amber-50 border-amber-300';
    }
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <History className="mr-2 h-6 w-6 text-trust-blue" />
        बदलाव का इतिहास
      </h2>

      {/* Edit Requests Section */}
      {requests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">प्रोफाइल अपडेट अनुरोध</h3>
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 ${getStatusColor(request.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className="font-semibold text-gray-900">
                      {request.status === 'approved' && 'स्वीकृत'}
                      {request.status === 'rejected' && 'अस्वीकृत'}
                      {request.status === 'pending' && 'लंबित'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatIndianDate(request.requested_at)}
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(request.new_data).map(([field, newValue]) => {
                    const oldValue = request.old_data[field];
                    return (
                      <div key={field} className="text-sm">
                        <p className="font-medium text-gray-900">{getFieldLabel(field)}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-gray-600 line-through">{oldValue || 'खाली'}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-900 font-semibold">{newValue || 'खाली'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="mt-3 bg-red-100 border-l-4 border-red-600 p-3 rounded">
                    <p className="text-sm text-red-900">
                      <strong>अस्वीकृति का कारण:</strong> {request.rejection_reason}
                    </p>
                  </div>
                )}

                {request.reviewed_at && (
                  <p className="text-xs text-gray-600 mt-3">
                    {request.status === 'approved' ? 'स्वीकृत' : 'समीक्षा'} समय: {formatIndianTime(request.reviewed_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change History Section */}
      {history.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">अनुमोदित बदलाव</h3>
          <div className="space-y-3">
            {history.map((change) => (
              <div
                key={change.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{getFieldLabel(change.field_name)}</p>
                    <p className="text-xs text-gray-600">
                      {change.change_type === 'admin_edit' && '🔧 Admin द्वारा संपादित'}
                      {change.change_type === 'employee_request_approved' && '✅ कर्मचारी अनुरोध स्वीकृत'}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatIndianDate(change.changed_at)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600 line-through">{change.old_value || 'खाली'}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-900 font-semibold">{change.new_value || 'खाली'}</span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  बदलाव किया: {change.changed_by}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && history.length === 0 && (
        <div className="text-center py-12">
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">अभी तक कोई बदलाव नहीं किया गया</p>
          <p className="text-sm text-gray-400 mt-2">
            प्रोफाइल में बदलाव करने पर यहां इतिहास दिखाई देगा
          </p>
        </div>
      )}
    </div>
  );
};

export default ChangeHistory;
