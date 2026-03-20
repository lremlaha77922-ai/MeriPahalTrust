import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  validateImageSize, 
  validateImageType, 
  resizeToExactDimensions, 
  detectBlur,
  compressImage 
} from '@/lib/imageValidation';
import { INDIAN_STATES, EDUCATION_LEVELS, COORDINATOR_ROLES } from '@/constants/indianStates';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Camera,
  Loader2
} from 'lucide-react';

const SwasthaSanginiApply = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    role: 'applicant',
    full_name: '',
    father_name: '',
    mother_name: '',
    age: '',
    gmail_id: '',
    whatsapp_number: '',
    facebook_profile: '',
    full_address: '',
    state: '',
    district: '',
    block_panchayat: '',
    pincode: '',
    bpo_name: '',
    pco_name: '',
    upi_id: '',
    education: '',
    total_experience: '',
    ngo_work_experience: '',
    why_join: '',
  });

  const [files, setFiles] = useState<{
    photo: File | null;
    aadharFront: File | null;
    aadharBack: File | null;
  }>({
    photo: null,
    aadharFront: null,
    aadharBack: null,
  });

  const [previews, setPreviews] = useState<{
    photo: string;
    aadharFront: string;
    aadharBack: string;
  }>({
    photo: '',
    aadharFront: '',
    aadharBack: '',
  });

  const [acceptDeclaration, setAcceptDeclaration] = useState(false);
  const [imageWarnings, setImageWarnings] = useState<{
    photo: string;
    aadharFront: string;
    aadharBack: string;
  }>({
    photo: '',
    aadharFront: '',
    aadharBack: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'photo' | 'aadharFront' | 'aadharBack'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateImageType(file)) {
      toast.error('केवल JPG, JPEG या PNG फाइल अपलोड करें');
      return;
    }

    // Validate file size
    if (!validateImageSize(file, 2)) {
      toast.error('फाइल का आकार 2MB से कम होना चाहिए');
      return;
    }

    // Blur detection for photo
    if (fieldName === 'photo') {
      const blurResult = await detectBlur(file);
      if (blurResult.isBlurry) {
        setImageWarnings((prev) => ({
          ...prev,
          [fieldName]: '⚠️ चेतावनी: फोटो धुंधली लग रही है। कृपया clear फोटो अपलोड करें।',
        }));
      } else {
        setImageWarnings((prev) => ({
          ...prev,
          [fieldName]: '',
        }));
      }
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    // Set file
    setFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const validateStep1 = (): boolean => {
    if (!formData.full_name.trim()) {
      toast.error('कृपया पूरा नाम दर्ज करें');
      return false;
    }
    if (!formData.father_name.trim()) {
      toast.error('कृपया पिता का नाम दर्ज करें');
      return false;
    }
    if (!formData.mother_name.trim()) {
      toast.error('कृपया माता का नाम दर्ज करें');
      return false;
    }
    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 18) {
      toast.error('आयु कम से कम 18 वर्ष होनी चाहिए');
      return false;
    }
    if (!formData.role) {
      toast.error('कृपया Role चुनें');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!formData.gmail_id || !emailRegex.test(formData.gmail_id)) {
      toast.error('कृपया valid Gmail ID दर्ज करें');
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.whatsapp_number || !phoneRegex.test(formData.whatsapp_number)) {
      toast.error('कृपया valid WhatsApp Number दर्ज करें (10 अंक)');
      return false;
    }
    if (!formData.full_address.trim()) {
      toast.error('कृपया पूरा पता दर्ज करें');
      return false;
    }
    if (!formData.state) {
      toast.error('कृपया State चुनें');
      return false;
    }
    if (!formData.district.trim()) {
      toast.error('कृपया District दर्ज करें');
      return false;
    }
    if (!formData.block_panchayat.trim()) {
      toast.error('कृपया Block/Panchayat दर्ज करें');
      return false;
    }
    const pincodeRegex = /^\d{6}$/;
    if (!formData.pincode || !pincodeRegex.test(formData.pincode)) {
      toast.error('कृपया valid Pincode दर्ज करें (6 अंक)');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.bpo_name.trim()) {
      toast.error('कृपया BPO Name दर्ज करें');
      return false;
    }
    if (!formData.pco_name.trim()) {
      toast.error('कृपया PCO Name दर्ज करें');
      return false;
    }
    if (!formData.upi_id.trim()) {
      toast.error('कृपया UPI ID दर्ज करें');
      return false;
    }
    if (!formData.education) {
      toast.error('कृपया Education चुनें');
      return false;
    }
    const minEducation = ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Diploma', 'Professional Degree'];
    if (!minEducation.includes(formData.education)) {
      toast.error('कम से कम 10th Pass होना आवश्यक है');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!files.photo) {
      toast.error('कृपया Passport Size Photo अपलोड करें');
      return false;
    }
    if (!files.aadharFront) {
      toast.error('कृपया Aadhaar Front अपलोड करें');
      return false;
    }
    if (!files.aadharBack) {
      toast.error('कृपया Aadhaar Back अपलोड करें');
      return false;
    }
    if (!acceptDeclaration) {
      toast.error('कृपया Declaration accept करें');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('swastha-documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('swastha-documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep4()) return;

    setLoading(true);

    try {
      // Process and compress photo to exact 300x400
      let photoBlob: Blob;
      if (files.photo) {
        photoBlob = await resizeToExactDimensions(files.photo, 300, 400, 0.85);
      } else {
        throw new Error('Photo is required');
      }

      // Compress Aadhaar images
      let aadharFrontBlob: Blob;
      let aadharBackBlob: Blob;
      
      if (files.aadharFront) {
        aadharFrontBlob = await compressImage(files.aadharFront, 800, 600, 0.8);
      } else {
        throw new Error('Aadhaar Front is required');
      }

      if (files.aadharBack) {
        aadharBackBlob = await compressImage(files.aadharBack, 800, 600, 0.8);
      } else {
        throw new Error('Aadhaar Back is required');
      }

      // Generate unique file names
      const timestamp = Date.now();
      const photoFile = new File([photoBlob], `photo_${timestamp}.jpg`, { type: 'image/jpeg' });
      const aadharFrontFile = new File([aadharFrontBlob], `aadhar_front_${timestamp}.jpg`, { type: 'image/jpeg' });
      const aadharBackFile = new File([aadharBackBlob], `aadhar_back_${timestamp}.jpg`, { type: 'image/jpeg' });

      // Upload files
      toast.info('फाइलें अपलोड हो रही हैं...');
      const photoUrl = await uploadFile(photoFile, `photos/${timestamp}_${formData.full_name.replace(/\s/g, '_')}.jpg`);
      const aadharFrontUrl = await uploadFile(aadharFrontFile, `aadhaar/${timestamp}_front.jpg`);
      const aadharBackUrl = await uploadFile(aadharBackFile, `aadhaar/${timestamp}_back.jpg`);

      // Insert application
      toast.info('आवेदन जमा हो रहा है...');
      const { data, error } = await supabase
        .from('swastha_applications')
        .insert([
          {
            role: formData.role,
            full_name: formData.full_name,
            father_name: formData.father_name,
            mother_name: formData.mother_name,
            age: parseInt(formData.age),
            gmail_id: formData.gmail_id,
            whatsapp_number: formData.whatsapp_number,
            facebook_profile: formData.facebook_profile || null,
            full_address: formData.full_address,
            state: formData.state,
            district: formData.district,
            block_panchayat: formData.block_panchayat,
            pincode: formData.pincode,
            bpo_name: formData.bpo_name,
            pco_name: formData.pco_name,
            upi_id: formData.upi_id,
            education: formData.education,
            total_experience: formData.total_experience || null,
            ngo_work_experience: formData.ngo_work_experience || null,
            why_join: formData.why_join || null,
            photo_url: photoUrl,
            aadhar_front_url: aadharFrontUrl,
            aadhar_back_url: aadharBackUrl,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('आवेदन सफलतापूर्वक जमा किया गया!');
      toast.info(`आपका Application ID: ${data.application_id}`);

      // Redirect to success page
      setTimeout(() => {
        navigate('/swastha-sangini/success', { 
          state: { applicationId: data.application_id } 
        });
      }, 2000);

    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'आवेदन जमा करने में त्रुटि हुई');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-900 font-semibold">Step 1 of 4: व्यक्तिगत जानकारी</p>
      </div>

      <div>
        <Label htmlFor="role">Role / पद चुनें *</Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          required
        >
          {COORDINATOR_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="full_name">पूरा नाम (Full Name) *</Label>
        <Input
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          placeholder="जैसे: अनिता शर्मा"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="father_name">पिता का नाम (Father's Name) *</Label>
          <Input
            id="father_name"
            name="father_name"
            value={formData.father_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="mother_name">माता का नाम (Mother's Name) *</Label>
          <Input
            id="mother_name"
            name="mother_name"
            value={formData.mother_name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="age">आयु (Age) * (कम से कम 18 वर्ष)</Label>
        <Input
          id="age"
          name="age"
          type="number"
          min="18"
          max="100"
          value={formData.age}
          onChange={handleInputChange}
          required
        />
        {formData.age && parseInt(formData.age) < 18 && (
          <p className="text-red-600 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            आयु कम से कम 18 वर्ष होनी चाहिए
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-900 font-semibold">Step 2 of 4: संपर्क और पता जानकारी</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="gmail_id">Gmail ID *</Label>
          <Input
            id="gmail_id"
            name="gmail_id"
            type="email"
            value={formData.gmail_id}
            onChange={handleInputChange}
            placeholder="example@gmail.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            type="tel"
            maxLength={10}
            value={formData.whatsapp_number}
            onChange={handleInputChange}
            placeholder="9876543210"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="facebook_profile">Facebook Profile Link (Optional)</Label>
        <Input
          id="facebook_profile"
          name="facebook_profile"
          type="url"
          value={formData.facebook_profile}
          onChange={handleInputChange}
          placeholder="https://facebook.com/yourprofile"
        />
      </div>

      <div>
        <Label htmlFor="full_address">पूरा पता (Full Address) *</Label>
        <Textarea
          id="full_address"
          name="full_address"
          value={formData.full_address}
          onChange={handleInputChange}
          rows={3}
          placeholder="मकान नंबर, गली, शहर/गांव"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="state">State / राज्य *</Label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          >
            <option value="">चुनें</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="district">District / जिला *</Label>
          <Input
            id="district"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="block_panchayat">Block / Panchayat *</Label>
          <Input
            id="block_panchayat"
            name="block_panchayat"
            value={formData.block_panchayat}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            name="pincode"
            type="text"
            maxLength={6}
            value={formData.pincode}
            onChange={handleInputChange}
            placeholder="110001"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-900 font-semibold">Step 3 of 4: कार्य और योग्यता जानकारी</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="bpo_name">BPO Name *</Label>
          <Input
            id="bpo_name"
            name="bpo_name"
            value={formData.bpo_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="pco_name">PCO Name *</Label>
          <Input
            id="pco_name"
            name="pco_name"
            value={formData.pco_name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="upi_id">UPI ID *</Label>
        <Input
          id="upi_id"
          name="upi_id"
          value={formData.upi_id}
          onChange={handleInputChange}
          placeholder="example@paytm"
          required
        />
      </div>

      <div>
        <Label htmlFor="education">शिक्षा (Education) * (कम से कम 10th Pass)</Label>
        <select
          id="education"
          name="education"
          value={formData.education}
          onChange={handleInputChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          required
        >
          <option value="">चुनें</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="total_experience">कुल अनुभव (Total Experience) (Optional)</Label>
          <Input
            id="total_experience"
            name="total_experience"
            value={formData.total_experience}
            onChange={handleInputChange}
            placeholder="जैसे: 5 वर्ष"
          />
        </div>
        <div>
          <Label htmlFor="ngo_work_experience">NGO Work Experience (Optional)</Label>
          <Input
            id="ngo_work_experience"
            name="ngo_work_experience"
            value={formData.ngo_work_experience}
            onChange={handleInputChange}
            placeholder="जैसे: 2 वर्ष"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="why_join">आप क्यों जुड़ना चाहते हैं? (Why Join) (Optional)</Label>
        <Textarea
          id="why_join"
          name="why_join"
          value={formData.why_join}
          onChange={handleInputChange}
          rows={4}
          placeholder="अपने विचार साझा करें..."
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-900 font-semibold">Step 4 of 4: दस्तावेज़ अपलोड करें</p>
      </div>

      {/* Photo Upload */}
      <div>
        <Label htmlFor="photo">Passport Size Photo * (Max 2MB, 300x400px)</Label>
        <div className="mt-2">
          <input
            type="file"
            id="photo"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleFileChange(e, 'photo')}
            className="hidden"
          />
          <label
            htmlFor="photo"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            {previews.photo ? (
              <img src={previews.photo} alt="Photo Preview" className="h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center">
                <Camera className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload photo</p>
                <p className="text-xs text-gray-500 mt-1">JPG, JPEG या PNG (Max 2MB)</p>
              </div>
            )}
          </label>
        </div>
        {imageWarnings.photo && (
          <p className="text-amber-600 text-sm mt-2 flex items-start">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            {imageWarnings.photo}
          </p>
        )}
      </div>

      {/* Aadhaar Front */}
      <div>
        <Label htmlFor="aadhar_front">Aadhaar Card (Front) * (Max 2MB)</Label>
        <div className="mt-2">
          <input
            type="file"
            id="aadhar_front"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleFileChange(e, 'aadharFront')}
            className="hidden"
          />
          <label
            htmlFor="aadhar_front"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            {previews.aadharFront ? (
              <img src={previews.aadharFront} alt="Aadhaar Front" className="h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload Aadhaar Front</p>
                <p className="text-xs text-gray-500 mt-1">JPG, JPEG या PNG (Max 2MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Aadhaar Back */}
      <div>
        <Label htmlFor="aadhar_back">Aadhaar Card (Back) * (Max 2MB)</Label>
        <div className="mt-2">
          <input
            type="file"
            id="aadhar_back"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleFileChange(e, 'aadharBack')}
            className="hidden"
          />
          <label
            htmlFor="aadhar_back"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            {previews.aadharBack ? (
              <img src={previews.aadharBack} alt="Aadhaar Back" className="h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload Aadhaar Back</p>
                <p className="text-xs text-gray-500 mt-1">JPG, JPEG या PNG (Max 2MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Declaration */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="declaration"
            checked={acceptDeclaration}
            onChange={(e) => setAcceptDeclaration(e.target.checked)}
            className="mt-1 mr-3"
          />
          <label htmlFor="declaration" className="text-sm text-gray-700">
            <strong>Declaration / घोषणा:</strong> मैं घोषणा करता/करती हूं कि मेरे द्वारा दी गई सभी जानकारी सत्य और सही है। 
            यदि कोई जानकारी गलत पाई जाती है तो मेरा आवेदन रद्द किया जा सकता है। मैं सभी नियम और शर्तों को स्वीकार करता/करती हूं।
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-8 rounded-t-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">स्वस्थ संगिनी कार्ड</h1>
            <p className="text-pink-100">Application Form / आवेदन फॉर्म</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white px-8 py-4 border-b">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      step >= i
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {i}
                  </div>
                  {i < 4 && (
                    <div
                      className={`h-1 w-12 md:w-24 ${
                        step > i ? 'bg-pink-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-b-2xl shadow-lg">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="border-pink-600 text-pink-600 hover:bg-pink-50"
                >
                  Previous
                </Button>
              )}
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-pink-600 hover:bg-pink-700 text-white ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-pink-600 hover:bg-pink-700 text-white ml-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      जमा हो रहा है...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Help:</strong> यदि आपको फॉर्म भरने में कोई समस्या हो रही है, तो कृपया +91 7073741421 पर संपर्क करें।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwasthaSanginiApply;
