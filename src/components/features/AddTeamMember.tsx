import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, X } from 'lucide-react';
import { INDIAN_STATES_DISTRICTS } from '@/constants/indianStates';

interface Props {
  coordinator: SwasthaCoordinator;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddTeamMember = ({ coordinator, onSuccess, onCancel }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    block_panchayat: coordinator.coordinator_type === 'district' ? '' : coordinator.block_panchayat || '',
  });

  const coordinatorType = coordinator.coordinator_type === 'district' ? 'block' : 'panchayat';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.full_name || !formData.mobile_number || !formData.email) {
        toast.error('सभी required fields भरें');
        setLoading(false);
        return;
      }

      if (coordinatorType === 'block' && !formData.block_panchayat) {
        toast.error('Block/Panchayat name required');
        setLoading(false);
        return;
      }

      // Insert new coordinator
      const { error } = await supabase
        .from('swastha_coordinators')
        .insert([
          {
            coordinator_type: coordinatorType,
            full_name: formData.full_name,
            state: coordinator.state,
            district: coordinator.district,
            block_panchayat: formData.block_panchayat || coordinator.block_panchayat,
            mobile_number: formData.mobile_number,
            email: formData.email,
            parent_coordinator_id: coordinator.id,
            is_active: true,
          },
        ]);

      if (error) throw error;

      toast.success(`${coordinatorType} Coordinator successfully added`);
      onSuccess();
    } catch (error: any) {
      console.error('Add team member error:', error);
      toast.error(error.message || 'Team member add करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <UserPlus className="h-6 w-6" />
            <h2 className="text-2xl font-bold">
              Add {coordinatorType === 'block' ? 'Block' : 'Panchayat'} Coordinator
            </h2>
          </div>
          <button onClick={onCancel} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Jurisdiction Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Jurisdiction</p>
            <p className="text-gray-900">
              {coordinator.state} → {coordinator.district}
              {coordinator.block_panchayat && ` → ${coordinator.block_panchayat}`}
            </p>
          </div>

          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter coordinator name"
              required
            />
          </div>

          {coordinator.coordinator_type === 'district' && (
            <div>
              <Label htmlFor="block_panchayat">Block/Panchayat Name *</Label>
              <Input
                id="block_panchayat"
                name="block_panchayat"
                value={formData.block_panchayat}
                onChange={handleInputChange}
                placeholder="Enter block or panchayat name"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="mobile_number">Mobile Number *</Label>
            <Input
              id="mobile_number"
              name="mobile_number"
              type="tel"
              value={formData.mobile_number}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="coordinator@example.com"
              required
            />
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Coordinator को email पर login credentials भेजे जाएंगे। 
              सुनिश्चित करें कि email address सही है।
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? 'Adding...' : 'Add Coordinator'}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMember;
