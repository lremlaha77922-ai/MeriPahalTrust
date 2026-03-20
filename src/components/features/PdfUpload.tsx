import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { isWithinUploadWindow, isSubmissionLate, getTimeRemainingInWindow, validatePdfFile } from '@/lib/utils';

interface PdfUploadProps {
  employeeId: string;
  onUploadSuccess: () => void;
}

const PdfUpload = ({ employeeId, onUploadSuccess }: PdfUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('कृपया PDF फ़ाइल चुनें');
      return;
    }

    // Check if already submitted today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingSubmission } = await supabase
      .from('pdf_submissions')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('submission_date', today)
      .single();

    if (existingSubmission) {
      toast.error('आज की PDF पहले ही जमा की जा चुकी है');
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileName = `${employeeId}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('daily-pdfs')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('daily-pdfs')
        .getPublicUrl(uploadData.path);

      // Insert submission record
      const isLate = isSubmissionLate();
      const { error: insertError } = await supabase
        .from('pdf_submissions')
        .insert({
          employee_id: employeeId,
          submission_date: today,
          pdf_url: publicUrl,
          is_late: isLate,
        });

      if (insertError) throw insertError;

      toast.success(isLate ? 'PDF जमा की गई (लेट मार्क)' : 'PDF सफलतापूर्वक जमा की गई');
      setSelectedFile(null);
      onUploadSuccess();
      
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('अपलोड विफल: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const canUpload = isWithinUploadWindow();
  const timeInfo = getTimeRemainingInWindow();
  const willBeLate = isSubmissionLate();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <Upload className="mr-2 h-6 w-6 text-trust-blue" />
        दैनिक PDF अपलोड
      </h2>

      {/* Time Status */}
      <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
        canUpload ? 'bg-green-50 border border-green-300' :
        willBeLate ? 'bg-red-50 border border-red-300' :
        'bg-amber-50 border border-amber-300'
      }`}>
        <Clock className={`h-5 w-5 mt-0.5 ${
          canUpload ? 'text-green-600' :
          willBeLate ? 'text-red-600' :
          'text-amber-600'
        }`} />
        <div className="flex-1">
          <p className={`font-semibold ${
            canUpload ? 'text-green-900' :
            willBeLate ? 'text-red-900' :
            'text-amber-900'
          }`}>
            {canUpload ? '✓ अपलोड विंडो खुली है' :
             willBeLate ? '⚠ समय समाप्त - लेट मार्क होगा' :
             '⏰ अपलोड विंडो बंद है'}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            {canUpload ? `${timeInfo} - 6:00 AM से 7:00 AM के बीच अपलोड करें` :
             willBeLate ? 'आप अभी भी अपलोड कर सकते हैं लेकिन लेट मार्क होगा' :
             `अपलोड समय: ${timeInfo}`}
          </p>
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="mb-6 bg-trust-lightblue p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-trust-blue" />
          महत्वपूर्ण निर्देश
        </h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>केवल PDF फॉर्मेट स्वीकार किया जाता है</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>अधिकतम फ़ाइल साइज़: 5 MB</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>अपलोड समय: 6:00 AM - 7:00 AM (सही समय पर)</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>7:00 AM के बाद अपलोड = लेट मार्क</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>प्रतिदिन केवल एक PDF जमा की जा सकती है</span>
          </li>
        </ul>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="pdf-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            PDF फ़ाइल चुनें
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

        {selectedFile && (
          <div className="bg-green-50 p-4 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-700">
                साइज़: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full bg-trust-blue hover:bg-blue-800"
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              अपलोड हो रहा है...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              PDF अपलोड करें
            </>
          )}
        </Button>

        {willBeLate && (
          <p className="text-sm text-red-600 text-center">
            ⚠ चेतावनी: यह सबमिशन लेट मार्क किया जाएगा
          </p>
        )}
      </div>
    </div>
  );
};

export default PdfUpload;
