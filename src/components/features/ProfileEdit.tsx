import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee, ProfileEditRequest } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, AlertCircle, Clock } from 'lucide-react';

interface ProfileEditProps {
  employee: Employee;
  onUpdateSuccess: () => void;
}

const ProfileEdit = ({ employee, onUpdateSuccess }: ProfileEditProps) => {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ProfileEditRequest[]>([]);
  const [formData, setFormData] = useState({
    mobile_number: employee.mobile_number,
    alternate_mobile: employee.alternate_mobile || '',
    email: employee.email || '',
    full_address: employee.full_address,
    bank_name: employee.bank_name,
    account_number: employee.account_number,
    ifsc_code: employee.ifsc_code,
  });

  useEffect(() => {
    fetchPendingRequests();
  }, [employee.id]);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_edit_requests')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Mobile number validation
    if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
      toast.error('मोबाइल नंबर 10 अंकों का होना चाहिए');
      return false;
    }

    // Alternate mobile validation
    if (formData.alternate_mobile && !/^[0-9]{10}$/.test(formData.alternate_mobile)) {
      toast.error('वैकल्पिक मोबाइल नंबर 10 अंकों का होना चाहिए');
      return false;
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('कृपया वैध ईमेल दर्ज करें');
      return false;
    }

    // IFSC code validation
    if (formData.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      toast.error('कृपया वैध IFSC कोड दर्ज करें');
      return false;
    }

    // Address validation
    if (!formData.full_address || formData.full_address.length < 10) {
      toast.error('पता कम से कम 10 अक्षर का होना चाहिए');
      return false;
    }

    // Bank details validation
    if (!formData.bank_name || !formData.account_number) {
      toast.error('बैंक का नाम और खाता संख्या अनिवार्य है');
      return false;
    }

    return true;
  };

  const getChangedFields = () => {
    const changes: Record<string, { old: string; new: string }> = {};
    
    if (formData.mobile_number !== employee.mobile_number) {
      changes.mobile_number = { old: employee.mobile_number, new: formData.mobile_number };
    }
    if (formData.alternate_mobile !== (employee.alternate_mobile || '')) {
      changes.alternate_mobile = { old: employee.alternate_mobile || '', new: formData.alternate_mobile };
    }
    if (formData.email !== (employee.email || '')) {
      changes.email = { old: employee.email || '', new: formData.email };
    }
    if (formData.full_address !== employee.full_address) {
      changes.full_address = { old: employee.full_address, new: formData.full_address };
    }
    if (formData.bank_name !== employee.bank_name) {
      changes.bank_name = { old: employee.bank_name, new: formData.bank_name };
    }
    if (formData.account_number !== employee.account_number) {
      changes.account_number = { old: employee.account_number, new: formData.account_number };
    }
    if (formData.ifsc_code !== employee.ifsc_code) {
      changes.ifsc_code = { old: employee.ifsc_code, new: formData.ifsc_code };
    }

    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const changes = getChangedFields();
    
    if (Object.keys(changes).length === 0) {
      toast.error('कोई बदलाव नहीं किया गया');
      return;
    }

    setSubmitting(true);

    try {
      const oldData: Record<string, string> = {};
      const newData: Record<string, string> = {};

      Object.entries(changes).forEach(([field, values]) => {
        oldData[field] = values.old;
        newData[field] = values.new;
      });

      // Create edit request
      const { error: requestError } = await supabase
        .from('profile_edit_requests')
        .insert({
          employee_id: employee.id,
          request_type: Object.keys(changes).length > 1 ? 'multiple' : Object.keys(changes)[0],
          old_data: oldData,
          new_data: newData,
          status: 'pending',
        });

      if (requestError) throw requestError;

      toast.success('प्रोफाइल अपडेट रिक्वेस्ट सबमिट की गई। स्वीकृति की प्रतीक्षा करें।');
      setEditing(false);
      fetchPendingRequests();
      onUpdateSuccess();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('सबमिशन विफल: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      mobile_number: employee.mobile_number,
      alternate_mobile: employee.alternate_mobile || '',
      email: employee.email || '',
      full_address: employee.full_address,
      bank_name: employee.bank_name,
      account_number: employee.account_number,
      ifsc_code: employee.ifsc_code,
    });
    setEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Edit className="mr-2 h-6 w-6 text-trust-blue" />
          प्रोफाइल संपादित करें
        </h2>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-trust-blue hover:bg-blue-800"
            disabled={pendingRequests.length > 0}
          >
            <Edit className="mr-2 h-4 w-4" />
            संपादित करें
          </Button>
        )}
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">लंबित अनुरोध</p>
              <p className="text-sm text-gray-700 mt-1">
                आपका प्रोफाइल अपडेट अनुरोध स्वीकृति के लिए प्रतीक्षारत है। 
                एक बार स्वीकृत/अस्वीकृत होने के बाद आप नया अनुरोध सबमिट कर सकते हैं।
              </p>
              <div className="mt-2 text-xs text-gray-600">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="mt-1">
                    📝 {new Date(req.requested_at).toLocaleDateString('hi-IN')} को सबमिट किया गया
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 bg-trust-lightblue p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-trust-blue" />
          महत्वपूर्ण जानकारी
        </h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>सभी बदलाव Admin की स्वीकृति के बाद ही लागू होंगे</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>मोबाइल नंबर 10 अंकों का होना चाहिए</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>IFSC कोड सही फॉर्मेट में होना चाहिए (जैसे: SBIN0001234)</span>
          </li>
          <li className="flex items-start">
            <span className="text-trust-blue mr-2">•</span>
            <span>बदलाव का इतिहास सुरक्षित रखा जाएगा</span>
          </li>
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">संपर्क जानकारी</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile_number">मोबाइल नंबर *</Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                type="tel"
                pattern="[0-9]{10}"
                value={formData.mobile_number}
                onChange={handleInputChange}
                disabled={!editing}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="alternate_mobile">वैकल्पिक मोबाइल</Label>
              <Input
                id="alternate_mobile"
                name="alternate_mobile"
                type="tel"
                pattern="[0-9]{10}"
                value={formData.alternate_mobile}
                onChange={handleInputChange}
                disabled={!editing}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email">ईमेल</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editing}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">पता</h3>
          <div>
            <Label htmlFor="full_address">पूरा पता *</Label>
            <Textarea
              id="full_address"
              name="full_address"
              value={formData.full_address}
              onChange={handleInputChange}
              disabled={!editing}
              required
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">बैंक विवरण</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="bank_name">बैंक का नाम *</Label>
              <Input
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                disabled={!editing}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="account_number">खाता संख्या *</Label>
              <Input
                id="account_number"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                disabled={!editing}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="ifsc_code">IFSC कोड *</Label>
              <Input
                id="ifsc_code"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                disabled={!editing}
                required
                className="mt-1"
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={submitting || pendingRequests.length > 0}
              className="flex-1 bg-trust-blue hover:bg-blue-800"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  सबमिट हो रहा है...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  बदलाव सबमिट करें
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              रद्द करें
            </Button>
          </div>
        )}
      </form>

      {/* Current Information Display */}
      {!editing && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            💡 अपनी जानकारी अपडेट करने के लिए "संपादित करें" बटन क्लिक करें
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileEdit;
