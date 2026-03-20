import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { TEAM_MEMBERS, OFFICIAL_WHATSAPP } from '@/constants/team';

const Join = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    full_name: '',
    father_husband_name: '',
    date_of_birth: '',
    full_address: '',
    mobile_number: '',
    alternate_mobile: '',
    email: '',
    aadhar_number: '',
    education: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
  });

  const [files, setFiles] = useState({
    photo: null as File | null,
    aadhar: null as File | null,
    signature: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'aadhar' | 'signature') => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [type]: e.target.files[0] });
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const sendWhatsAppNotifications = (name: string, mobile: string) => {
    const message = encodeURIComponent(
      `नया जॉइन आवेदन प्राप्त हुआ\n\n` +
      `नाम: ${name}\n` +
      `मोबाइल: ${mobile}\n\n` +
      `कृपया Admin Panel में देखें।`
    );

    const numbers = TEAM_MEMBERS.map(m => m.mobile);
    
    numbers.forEach((number) => {
      window.open(`https://wa.me/91${number}?text=${message}`, '_blank');
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast.error('कृपया घोषणा को स्वीकार करें');
      return;
    }

    if (!files.photo || !files.aadhar || !files.signature) {
      toast.error('कृपया सभी दस्तावेज़ अपलोड करें');
      return;
    }

    setLoading(true);

    try {
      // Upload files
      const [photoUrl, aadharUrl, signatureUrl] = await Promise.all([
        uploadFile(files.photo, 'photos'),
        uploadFile(files.aadhar, 'aadhar'),
        uploadFile(files.signature, 'signatures'),
      ]);

      // Insert employee data
      const { error: insertError } = await supabase
        .from('employees')
        .insert([
          {
            ...formData,
            photo_url: photoUrl,
            aadhar_url: aadharUrl,
            signature_url: signatureUrl,
            status: 'pending',
          },
        ]);

      if (insertError) throw insertError;

      toast.success('आवेदन सफलतापूर्वक जमा हुआ!');
      
      // Send WhatsApp notifications
      sendWhatsAppNotifications(formData.full_name, formData.mobile_number);

      // Navigate to success page or home
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'कुछ गड़बड़ी हुई। कृपया पुनः प्रयास करें।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-trust-blue text-center mb-4">
              पंजीकरण फॉर्म
            </h1>
            <p className="text-center text-gray-600 mb-6">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>

            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${step >= 1 ? 'text-trust-blue' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-trust-blue bg-trust-blue text-white' : 'border-gray-400'}`}>
                    1
                  </div>
                  <span className="ml-2 hidden sm:inline">व्यक्तिगत जानकारी</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center ${step >= 2 ? 'text-trust-blue' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-trust-blue bg-trust-blue text-white' : 'border-gray-400'}`}>
                    2
                  </div>
                  <span className="ml-2 hidden sm:inline">बैंक विवरण</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center ${step >= 3 ? 'text-trust-blue' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-trust-blue bg-trust-blue text-white' : 'border-gray-400'}`}>
                    3
                  </div>
                  <span className="ml-2 hidden sm:inline">दस्तावेज़</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">व्यक्तिगत जानकारी</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name">पूरा नाम *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="father_husband_name">पिता/पति का नाम *</Label>
                      <Input
                        id="father_husband_name"
                        name="father_husband_name"
                        value={formData.father_husband_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date_of_birth">जन्म तिथि *</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mobile_number">मोबाइल नंबर *</Label>
                      <Input
                        id="mobile_number"
                        name="mobile_number"
                        type="tel"
                        pattern="[0-9]{10}"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
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
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">ईमेल</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="aadhar_number">आधार नंबर *</Label>
                      <Input
                        id="aadhar_number"
                        name="aadhar_number"
                        type="text"
                        pattern="[0-9]{12}"
                        value={formData.aadhar_number}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="education">शिक्षा *</Label>
                      <Input
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="full_address">पूरा पता *</Label>
                    <Textarea
                      id="full_address"
                      name="full_address"
                      value={formData.full_address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-trust-blue hover:bg-blue-800"
                    >
                      आगे बढ़ें
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Bank Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">बैंक विवरण</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="bank_name">बैंक का नाम *</Label>
                      <Input
                        id="bank_name"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleInputChange}
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
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      पिछला
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-trust-blue hover:bg-blue-800"
                    >
                      आगे बढ़ें
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">दस्तावेज़ अपलोड करें</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="photo">फोटो अपलोड * (JPG/PNG)</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-trust-blue transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'photo')}
                          required
                          className="hidden"
                        />
                        <label htmlFor="photo" className="cursor-pointer text-sm text-gray-600">
                          {files.photo ? files.photo.name : 'फ़ाइल चुनें'}
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="aadhar">आधार अपलोड * (PDF/JPG)</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-trust-blue transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <Input
                          id="aadhar"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(e, 'aadhar')}
                          required
                          className="hidden"
                        />
                        <label htmlFor="aadhar" className="cursor-pointer text-sm text-gray-600">
                          {files.aadhar ? files.aadhar.name : 'फ़ाइल चुनें'}
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signature">हस्ताक्षर अपलोड * (JPG/PNG)</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-trust-blue transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <Input
                          id="signature"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'signature')}
                          required
                          className="hidden"
                        />
                        <label htmlFor="signature" className="cursor-pointer text-sm text-gray-600">
                          {files.signature ? files.signature.name : 'फ़ाइल चुनें'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="bg-amber-50 border-l-4 border-trust-gold p-6 rounded">
                    <h3 className="font-bold text-gray-900 mb-3">घोषणा</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      मैं घोषणा करता/करती हूं कि मैंने सभी नियम, शर्तें और दिशानिर्देश पढ़ लिए हैं और उन्हें स्वीकार करता/करती हूं। 
                      मैं समझता/समझती हूं कि झूठी जानकारी प्रदान करने पर मेरी सेवा तत्काल समाप्त की जा सकती है। 
                      मैं राजस्थान न्यायालय के क्षेत्राधिकार को स्वीकार करता/करती हूं।
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agree"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      />
                      <label
                        htmlFor="agree"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        मैं सभी नियम और शर्तें स्वीकार करता/करती हूं *
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      पिछला
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !agreed}
                      className="bg-trust-gold hover:bg-amber-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          जमा हो रहा है...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          आवेदन जमा करें
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Join;