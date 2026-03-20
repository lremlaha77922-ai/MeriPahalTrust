import { useState } from 'react';
import { SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  Camera,
  Edit,
  Save,
  X,
  IdCard,
  Hash,
} from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
  onUpdate: () => void;
}

const CoordinatorProfile = ({ coordinator, onUpdate }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    upi_id: coordinator.upi_id || '',
    bank_name: coordinator.bank_name || '',
    account_number: coordinator.account_number || '',
    ifsc_code: coordinator.ifsc_code || '',
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('कृपया केवल image file upload करें');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo size 2MB से कम होनी चाहिए');
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${coordinator.id}-profile-${Date.now()}.${fileExt}`;
      const filePath = `coordinator-profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('swastha-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swastha-documents')
        .getPublicUrl(filePath);

      // Update coordinator record
      const { error: updateError } = await supabase
        .from('swastha_coordinators')
        .update({ profile_photo_url: publicUrl })
        .eq('id', coordinator.id);

      if (updateError) throw updateError;

      toast.success('Profile photo updated successfully');
      onUpdate();
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast.error('Photo upload में त्रुटि');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBanking = async () => {
    try {
      const { error } = await supabase
        .from('swastha_coordinators')
        .update({
          upi_id: formData.upi_id,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          ifsc_code: formData.ifsc_code,
        })
        .eq('id', coordinator.id);

      if (error) throw error;

      toast.success('Banking details updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Update में त्रुटि');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
              {coordinator.profile_photo_url ? (
                <img
                  src={coordinator.profile_photo_url}
                  alt={coordinator.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-rose-500">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white text-pink-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-pink-50">
              <Camera className="h-5 w-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Coordinator Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{coordinator.full_name}</h1>
            <p className="text-pink-100 mb-4 capitalize">
              {coordinator.coordinator_type} Coordinator
            </p>
            
            {coordinator.coordinator_id && (
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <IdCard className="h-4 w-4 mr-2" />
                <span className="font-mono font-bold">{coordinator.coordinator_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-pink-600" />
          Personal Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mobile Number</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              {coordinator.mobile_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              {coordinator.email}
            </p>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-pink-600" />
          Location Details
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">State</p>
            <p className="font-semibold text-gray-900">{coordinator.state}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">District</p>
            <p className="font-semibold text-gray-900">{coordinator.district}</p>
          </div>
          {coordinator.block_panchayat && (
            <div>
              <p className="text-sm text-gray-600">Block/Panchayat</p>
              <p className="font-semibold text-gray-900">{coordinator.block_panchayat}</p>
            </div>
          )}
          {coordinator.pincode && (
            <div>
              <p className="text-sm text-gray-600">Pincode</p>
              <p className="font-semibold text-gray-900 flex items-center">
                <Hash className="h-4 w-4 mr-2 text-gray-400" />
                {coordinator.pincode}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Banking Details */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-pink-600" />
            Banking Details
          </h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveBanking}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    upi_id: coordinator.upi_id || '',
                    bank_name: coordinator.bank_name || '',
                    account_number: coordinator.account_number || '',
                    ifsc_code: coordinator.ifsc_code || '',
                  });
                }}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
            {isEditing ? (
              <Input
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                placeholder="yourname@upi"
              />
            ) : (
              <p className="font-semibold text-gray-900">{coordinator.upi_id || 'Not added'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
            {isEditing ? (
              <Input
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Bank Name"
              />
            ) : (
              <p className="font-semibold text-gray-900 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                {coordinator.bank_name || 'Not added'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Account Number</label>
            {isEditing ? (
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Account Number"
              />
            ) : (
              <p className="font-semibold text-gray-900">
                {coordinator.account_number ? `****${coordinator.account_number.slice(-4)}` : 'Not added'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">IFSC Code</label>
            {isEditing ? (
              <Input
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                placeholder="IFSC Code"
                maxLength={11}
              />
            ) : (
              <p className="font-semibold text-gray-900">{coordinator.ifsc_code || 'Not added'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Account Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-full font-semibold ${
            coordinator.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {coordinator.is_active ? '✓ Active' : 'Inactive'}
          </div>
          <div className="text-sm text-gray-600">
            Appointed: {new Date(coordinator.appointed_date).toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorProfile;
