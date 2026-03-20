import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Clock, AlertCircle, IndianRupee, Image as ImageIcon } from 'lucide-react';

interface DepositSubmissionProps {
  employeeId: string;
  onSubmitSuccess: () => void;
}

const DepositSubmission = ({ employeeId, onSubmitSuccess }: DepositSubmissionProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('केवल इमेज फाइल स्वीकार की जाती है');
      event.target.value = '';
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('फाइल का आकार 5MB से अधिक नहीं होना चाहिए');
      event.target.value = '';
      return;
    }

    setScreenshot(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('कृपया वैध राशि दर्ज करें');
      return;
    }

    if (!screenshot) {
      toast.error('कृपया ट्रांज़ैक्शन स्क्रीनशॉट अपलोड करें');
      return;
    }

    // Check if deposit already submitted today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingDeposit } = await supabase
      .from('deposits')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('deposit_date', today)
      .single();

    if (existingDeposit) {
      toast.error('आज की जमा राशि पहले ही सबमिट की जा चुकी है');
      return;
    }

    setSubmitting(true);

    try {
      // Upload screenshot
      const fileName = `${employeeId}-${Date.now()}.${screenshot.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deposit-screenshots')
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deposit-screenshots')
        .getPublicUrl(uploadData.path);

      // Insert deposit record
      const { error: insertError } = await supabase
        .from('deposits')
        .insert({
          employee_id: employeeId,
          amount: parseFloat(amount),
          transaction_screenshot_url: publicUrl,
          deposit_date: today,
          status: 'pending',
        });

      if (insertError) throw insertError;

      toast.success('जमा राशि सफलतापूर्वक सबमिट की गई। स्वीकृति की प्रतीक्षा करें।');
      
      // Reset form
      setAmount('');
      setScreenshot(null);
      setPreviewUrl('');
      const fileInput = document.getElementById('screenshot-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onSubmitSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('सबमिशन विफल: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <IndianRupee className="mr-2 h-6 w-6 text-trust-blue" />
        जमा राशि सबमिट करें
      </h2>

      {/* Important Notice */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">24 घंटे की समय सीमा</p>
            <p className="text-sm text-gray-700 mt-1">
              सुरक्षा जमा राशि को 24 घंटे के भीतर जमा करना अनिवार्य है। 
              देर से जमा करने पर चेतावनी दी जा सकती है।
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 bg-trust-lightblue p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-trust-blue" />
          निर्देश
        </h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>सही राशि दर्ज करें</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>ट्रांज़ैक्शन ID और समय स्पष्ट दिखना चाहिए</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>स्क्रीनशॉट स्पष्ट और पठनीय होना चाहिए</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>अधिकतम फाइल साइज़: 5 MB</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>केवल इमेज फॉर्मेट (JPG, PNG) स्वीकार किए जाते हैं</span>
          </li>
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <Label htmlFor="amount">जमा राशि (₹)</Label>
          <div className="relative mt-1">
            <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="राशि दर्ज करें"
              className="pl-10"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            वास्तविक ट्रांज़ैक्शन राशि दर्ज करें
          </p>
        </div>

        {/* Screenshot Upload */}
        <div>
          <Label htmlFor="screenshot-upload">
            ट्रांज़ैक्शन स्क्रीनशॉट
          </Label>
          <input
            id="screenshot-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none mt-1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            पेमेंट प्रूफ के रूप में ट्रांज़ैक्शन स्क्रीनशॉट अपलोड करें
          </p>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="border-2 border-green-300 bg-green-50 p-4 rounded-lg">
            <p className="font-semibold text-green-900 mb-3 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              स्क्रीनशॉट प्रीव्यू
            </p>
            <img
              src={previewUrl}
              alt="Transaction screenshot preview"
              className="max-w-full h-auto rounded border border-gray-300"
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-trust-blue hover:bg-blue-800"
        >
          {submitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              सबमिट हो रहा है...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              जमा राशि सबमिट करें
            </>
          )}
        </Button>
      </form>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          स्वीकृति के बाद आपको सूचना मिल जाएगी। कृपया धैर्य रखें।
        </p>
      </div>
    </div>
  );
};

export default DepositSubmission;
