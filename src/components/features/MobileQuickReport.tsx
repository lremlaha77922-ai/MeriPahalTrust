import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileText, Camera, Send } from 'lucide-react';
import { isOnline, saveOfflineData } from '@/lib/pwa';

interface Props {
  coordinator: SwasthaCoordinator;
  onSuccess?: () => void;
}

const MobileQuickReport = ({ coordinator, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    report_type: 'daily',
    activities_conducted: 0,
    achievements: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'activities_conducted' ? parseInt(value) || 0 : value,
    }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const reportData = {
        coordinator_id: coordinator.id,
        report_type: formData.report_type,
        report_period: today,
        activities_conducted: formData.activities_conducted,
        achievements: formData.achievements,
        total_applications: 0,
        approved_count: 0,
        rejected_count: 0,
        pending_count: 0,
        beneficiaries_reached: 0,
      };

      if (isOnline()) {
        const { error } = await supabase
          .from('swastha_reports')
          .insert([reportData]);

        if (error) throw error;
        toast.success('Report submitted');
      } else {
        await saveOfflineData('pending_reports', reportData);
        toast.info('Report saved offline. Will submit when online.');
      }

      // Reset form
      setFormData({
        report_type: 'daily',
        activities_conducted: 0,
        achievements: '',
      });
      setPhotoFile(null);
      setPhotoPreview('');
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Report submission में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 -m-6 mb-6 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6" />
          <h2 className="text-xl font-bold">Quick Report</h2>
        </div>
      </div>

      <div>
        <Label htmlFor="report_type">Report Type</Label>
        <select
          id="report_type"
          name="report_type"
          value={formData.report_type}
          onChange={handleInputChange}
          className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-base"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <Label htmlFor="activities_conducted">Activities Today</Label>
        <Input
          id="activities_conducted"
          name="activities_conducted"
          type="number"
          min="0"
          value={formData.activities_conducted}
          onChange={handleInputChange}
          className="text-base h-12"
        />
      </div>

      <div>
        <Label htmlFor="achievements">Key Achievements</Label>
        <Textarea
          id="achievements"
          name="achievements"
          value={formData.achievements}
          onChange={handleInputChange}
          rows={4}
          placeholder="Describe your accomplishments today..."
          className="text-base"
        />
      </div>

      {/* Photo Upload */}
      <div>
        <Label>Activity Photo (Optional)</Label>
        <div className="mt-2">
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <div className="text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {photoFile ? photoFile.name : 'Take Photo'}
              </p>
            </div>
          </label>
        </div>
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Preview"
            className="mt-3 w-full h-48 object-cover rounded-lg"
          />
        )}
      </div>

      {/* Offline Indicator */}
      {!isOnline() && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <p className="text-sm text-amber-800">
            📡 You're offline. Report will be submitted when connection is restored.
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
      >
        <Send className="h-5 w-5 mr-2" />
        {loading ? 'Submitting...' : 'Submit Report'}
      </Button>
    </form>
  );
};

export default MobileQuickReport;
