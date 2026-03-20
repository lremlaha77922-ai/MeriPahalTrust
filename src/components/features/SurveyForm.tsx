import { useState, useRef } from 'react';
import { SwasthaCoordinator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Camera,
  Video,
  Upload,
  Play,
  Square,
  CheckCircle,
  Hash,
} from 'lucide-react';

interface Props {
  coordinator: SwasthaCoordinator;
  onSuccess: () => void;
}

const SurveyForm = ({ coordinator, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    village: '',
    pincode: '',
    woman_name: '',
    woman_age: '',
    woman_mobile: '',
    pad_usage: '',
    awareness_level: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('कृपया केवल image file select करें');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size 5MB से कम होनी चाहिए');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoFile = new File([videoBlob], `survey-video-${Date.now()}.webm`, {
          type: 'video/webm',
        });
        setVideoFile(videoFile);
        setVideoPreview(URL.createObjectURL(videoBlob));

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 30) {
            stopVideoRecording();
            return 30;
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Video recording error:', error);
      toast.error('Video recording शुरू करने में त्रुटि');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      toast.success('Video recorded successfully');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('कृपया केवल video file select करें');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video size 50MB से कम होनी चाहिए');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.village || !formData.pincode || !formData.woman_name || !formData.woman_age) {
      toast.error('कृपया सभी required fields भरें');
      return;
    }

    if (!formData.pad_usage || !formData.awareness_level) {
      toast.error('कृपया Pad Usage और Awareness Level select करें');
      return;
    }

    if (!videoFile) {
      toast.error('कृपया survey video record करें');
      return;
    }

    if (!coordinator.coordinator_id) {
      toast.error('Coordinator ID not found');
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl = null;
      let videoUrl = null;

      // Upload photo if exists
      if (photoFile) {
        const photoPath = `survey-photos/${coordinator.coordinator_id}-${Date.now()}.jpg`;
        const { error: photoError } = await supabase.storage
          .from('swastha-documents')
          .upload(photoPath, photoFile);

        if (photoError) throw photoError;

        const { data: { publicUrl } } = supabase.storage
          .from('swastha-documents')
          .getPublicUrl(photoPath);
        
        photoUrl = publicUrl;
      }

      // Upload video (required)
      const videoPath = `survey-videos/${coordinator.coordinator_id}-${Date.now()}.webm`;
      const { error: videoError } = await supabase.storage
        .from('swastha-documents')
        .upload(videoPath, videoFile);

      if (videoError) throw videoError;

      const { data: { publicUrl: videoPublicUrl } } = supabase.storage
        .from('swastha-documents')
        .getPublicUrl(videoPath);
      
      videoUrl = videoPublicUrl;

      // Save survey to database
      const { error: insertError } = await supabase
        .from('panchayat_surveys')
        .insert({
          coordinator_id: coordinator.coordinator_id,
          state: coordinator.state,
          district: coordinator.district,
          block_panchayat: coordinator.block_panchayat || '',
          village: formData.village,
          pincode: formData.pincode,
          woman_name: formData.woman_name,
          woman_age: parseInt(formData.woman_age),
          woman_mobile: formData.woman_mobile || null,
          pad_usage: formData.pad_usage,
          awareness_level: formData.awareness_level,
          photo_url: photoUrl,
          video_url: videoUrl,
        });

      if (insertError) throw insertError;

      toast.success('Survey submitted successfully');
      
      // Reset form
      setFormData({
        village: '',
        pincode: '',
        woman_name: '',
        woman_age: '',
        woman_mobile: '',
        pad_usage: '',
        awareness_level: '',
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setVideoFile(null);
      setVideoPreview(null);

      onSuccess();

    } catch (error: any) {
      console.error('Survey submission error:', error);
      toast.error('Survey submission में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Details */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-pink-600" />
          Location Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Village <span className="text-red-600">*</span>
            </label>
            <Input
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="गाँव का नाम"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode <span className="text-red-600">*</span>
            </label>
            <Input
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="Pincode"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
          </div>
        </div>
      </div>

      {/* Woman Details */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-pink-600" />
          Woman Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Woman Name <span className="text-red-600">*</span>
            </label>
            <Input
              value={formData.woman_name}
              onChange={(e) => setFormData({ ...formData, woman_name: e.target.value })}
              placeholder="महिला का पूरा नाम"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-red-600">*</span>
            </label>
            <Input
              type="number"
              value={formData.woman_age}
              onChange={(e) => setFormData({ ...formData, woman_age: e.target.value })}
              placeholder="Age"
              min="10"
              max="100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number (Optional)
            </label>
            <Input
              value={formData.woman_mobile}
              onChange={(e) => setFormData({ ...formData, woman_mobile: e.target.value })}
              placeholder="Mobile Number"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>
        </div>
      </div>

      {/* Survey Questions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Survey Questions</h3>
        
        <div className="space-y-4">
          {/* Pad Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pad Usage <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'yes_regular', label: 'Yes, Regular Use' },
                { value: 'yes_occasional', label: 'Yes, Occasional Use' },
                { value: 'no_never', label: 'No, Never Used' },
                { value: 'prefer_not_say', label: 'Prefer Not to Say' },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="pad_usage"
                    value={option.value}
                    checked={formData.pad_usage === option.value}
                    onChange={(e) => setFormData({ ...formData, pad_usage: e.target.value })}
                    className="text-pink-600 focus:ring-pink-500"
                    required
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Awareness Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Awareness Level <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'very_aware', label: 'Very Aware - Full Knowledge' },
                { value: 'somewhat_aware', label: 'Somewhat Aware - Basic Knowledge' },
                { value: 'not_aware', label: 'Not Aware - Limited Knowledge' },
                { value: 'need_education', label: 'Need Education - No Knowledge' },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="awareness_level"
                    value={option.value}
                    checked={formData.awareness_level === option.value}
                    onChange={(e) => setFormData({ ...formData, awareness_level: e.target.value })}
                    className="text-pink-600 focus:ring-pink-500"
                    required
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload (Optional) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Camera className="h-5 w-5 mr-2 text-pink-600" />
          Photo Upload (Optional)
        </h3>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 cursor-pointer"
          >
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Take or Upload Photo</p>
            </div>
          </label>
          {photoPreview && (
            <div className="relative">
              <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
              <Button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Video Recording (Mandatory) */}
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-pink-300">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <Video className="h-5 w-5 mr-2 text-pink-600" />
          Video Recording <span className="text-red-600 ml-2">* (Mandatory - 30 seconds)</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">Record a 30-second survey video (interview or interaction)</p>
        
        <div className="space-y-4">
          {!videoFile && !isRecording && (
            <Button
              type="button"
              onClick={startVideoRecording}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <div className="space-y-3">
              <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="font-bold text-red-600">Recording...</span>
                  </div>
                  <span className="font-mono text-xl font-bold text-red-600">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(recordingTime / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
              <Button
                type="button"
                onClick={stopVideoRecording}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white h-12"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            </div>
          )}

          {videoFile && videoPreview && (
            <div className="space-y-3">
              <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-600">Video Recorded Successfully</span>
                </div>
                <video src={videoPreview} controls className="w-full rounded-lg" />
              </div>
              <Button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                Record Again
              </Button>
            </div>
          )}

          {!videoFile && !isRecording && (
            <>
              <div className="text-center text-gray-500">OR</div>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 cursor-pointer"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload Existing Video</p>
                </div>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!videoFile || submitting}
        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white h-12 text-lg font-bold"
      >
        {submitting ? 'Submitting...' : 'Submit Survey'}
      </Button>

      {!videoFile && (
        <p className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          ⚠️ Video recording is mandatory to submit the survey
        </p>
      )}
    </form>
  );
};

export default SurveyForm;
