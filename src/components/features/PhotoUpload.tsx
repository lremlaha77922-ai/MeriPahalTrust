import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload, Camera, AlertCircle, CheckCircle, X } from 'lucide-react';

interface PhotoUploadProps {
  employeeId: string;
  currentPhotoUrl?: string;
  onUploadSuccess: (photoUrl: string) => void;
}

const PhotoUpload = ({ employeeId, currentPhotoUrl, onUploadSuccess }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error('फोटो का साइज़ 2MB से अधिक नहीं होना चाहिए');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('कृपया फोटो चुनें');
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${employeeId}-photo-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(uploadData.path);

      // Update employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({ photo_url: publicUrl })
        .eq('id', employeeId);

      if (updateError) throw updateError;

      toast.success('फोटो सफलतापूर्वक अपलोड की गई');
      onUploadSuccess(publicUrl);
      
      // Reset
      setSelectedFile(null);
      setPreviewUrl('');
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('अपलोड विफल: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <Camera className="mr-2 h-6 w-6 text-trust-blue" />
        प्रोफाइल फोटो अपलोड करें
      </h2>

      {/* Current Photo */}
      {currentPhotoUrl && !previewUrl && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">वर्तमान फोटो:</p>
          <div className="relative inline-block">
            <img
              src={currentPhotoUrl}
              alt="Current profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-trust-blue shadow-md"
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 bg-trust-lightblue p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-trust-blue" />
          निर्देश
        </h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>केवल इमेज फॉर्मेट (JPG, PNG, WebP) स्वीकार किए जाते हैं</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>अधिकतम फोटो साइज़: 2 MB</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>स्पष्ट और पासपोर्ट साइज़ फोटो अपलोड करें</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>फोटो में चेहरा साफ दिखना चाहिए</span>
          </li>
        </ul>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="photo-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            फोटो चुनें (अधिकतम 2MB)
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            disabled={uploading}
          />
        </div>

        {/* Preview */}
        {previewUrl && selectedFile && (
          <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <p className="font-semibold text-green-900 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                फोटो प्रीव्यू
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelPreview}
                disabled={uploading}
                className="text-gray-600 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-start space-x-4">
              <img
                src={previewUrl}
                alt="Photo preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-md"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-1">
                  <strong>फाइल नाम:</strong> {selectedFile.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>साइज़:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {selectedFile.size > 2 * 1024 * 1024 && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    फोटो 2MB से बड़ी है
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
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
              फोटो अपलोड करें
            </>
          )}
        </Button>
      </div>

      {/* Size Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 सुझाव: फोटो का साइज़ कम करने के लिए किसी भी ऑनलाइन image compressor का उपयोग करें
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;
