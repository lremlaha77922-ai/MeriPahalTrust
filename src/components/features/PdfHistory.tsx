import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PdfSubmission } from '@/types';
import { FileText, Download, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatIndianDate, formatIndianTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PdfHistoryProps {
  employeeId: string;
  refresh: number;
}

const PdfHistory = ({ employeeId, refresh }: PdfHistoryProps) => {
  const [submissions, setSubmissions] = useState<PdfSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [employeeId, refresh]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pdf_submissions')
        .select('*')
        .eq('employee_id', employeeId)
        .order('submission_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, date: string) => {
    window.open(url, '_blank');
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
        <FileText className="mr-2 h-6 w-6 text-trust-blue" />
        अपलोड इतिहास
      </h2>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">कोई PDF अपलोड नहीं की गई</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={`border rounded-lg p-4 ${
                submission.is_late ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {submission.is_late ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    <span className={`font-semibold ${
                      submission.is_late ? 'text-red-900' : 'text-green-900'
                    }`}>
                      {formatIndianDate(submission.submission_date)}
                    </span>
                    {submission.is_late && (
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-semibold">
                        LATE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4" />
                    <span>अपलोड समय: {formatIndianTime(submission.submitted_at)}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(submission.pdf_url, submission.submission_date)}
                  className="bg-trust-blue hover:bg-blue-800"
                >
                  <Download className="h-4 w-4 mr-1" />
                  डाउनलोड
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {submissions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{submissions.filter(s => !s.is_late).length}</p>
              <p className="text-sm text-gray-600">समय पर अपलोड</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{submissions.filter(s => s.is_late).length}</p>
              <p className="text-sm text-gray-600">लेट अपलोड</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfHistory;
