import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator, PanchayatSurvey } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  saveSurveyOffline,
  getPendingSurveys,
  markAsSynced,
  getCurrentLocation,
  isOnline,
  getStorageStats,
  deleteSurvey,
} from '@/lib/offlineStorage';
import {
  Home,
  Camera,
  List,
  User,
  MapPin,
  Video,
  Upload,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  Play,
  Square,
  Loader2,
  Trash2,
  CloudUpload,
  Database,
  Navigation,
} from 'lucide-react';

const MobileSurveyApp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'survey' | 'list' | 'profile'>('home');
  const [coordinator, setCoordinator] = useState<SwasthaCoordinator | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [storageStats, setStorageStats] = useState({ total: 0, pending: 0, synced: 0 });

  // Survey form state
  const [formData, setFormData] = useState({
    village: '',
    pincode: '',
    woman_name: '',
    woman_age: '',
    woman_mobile: '',
    pad_usage: '',
    awareness_level: '',
  });

  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    checkAuth();
    updateStorageStats();

    // Listen to online/offline events
    const handleOnline = () => {
      setOnline(true);
      toast.success('🟢 Online - Ready to sync');
      autoSyncPendingSurveys();
    };
    const handleOffline = () => {
      setOnline(false);
      toast.warning('🔴 Offline - Surveys will be saved locally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('कृपया पहले login करें');
        navigate('/admin');
        return;
      }

      const { data: coordData, error } = await supabase
        .from('swastha_coordinators')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (error || !coordData) {
        toast.error('Coordinator access denied');
        navigate('/');
        return;
      }

      setCoordinator(coordData);
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Authentication error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const updateStorageStats = async () => {
    const stats = await getStorageStats();
    setStorageStats(stats);
  };

  const captureLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      toast.success(`📍 Location captured (±${Math.round(loc.accuracy)}m)`);
    } catch (error) {
      console.error('Location error:', error);
      toast.error('Location capture failed');
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        video: { facingMode: 'environment', width: 1280, height: 720 },
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
      toast.success('✓ Video recorded successfully');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.village || !formData.woman_name || !formData.woman_age) {
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

    if (!coordinator?.coordinator_id) {
      toast.error('Coordinator ID not found');
      return;
    }

    setSubmitting(true);

    try {
      if (online) {
        // Upload directly if online
        await uploadSurveyOnline();
      } else {
        // Save offline
        await saveSurveyOfflineMode();
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Submission में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadSurveyOnline = async () => {
    if (!coordinator) return;

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

    // Upload video
    const videoPath = `survey-videos/${coordinator.coordinator_id}-${Date.now()}.webm`;
    const { error: videoError } = await supabase.storage
      .from('swastha-documents')
      .upload(videoPath, videoFile!);

    if (videoError) throw videoError;

    const { data: { publicUrl: videoPublicUrl } } = supabase.storage
      .from('swastha-documents')
      .getPublicUrl(videoPath);
    
    videoUrl = videoPublicUrl;

    // Save to database
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

    toast.success('✓ Survey uploaded successfully');
    resetForm();
    setActiveTab('home');
  };

  const saveSurveyOfflineMode = async () => {
    if (!coordinator) return;

    await saveSurveyOffline({
      coordinatorId: coordinator.coordinator_id!,
      formData: {
        state: coordinator.state,
        district: coordinator.district,
        block_panchayat: coordinator.block_panchayat || '',
        ...formData,
      },
      photoBlob: photoFile || undefined,
      videoBlob: videoFile!,
      location: location || undefined,
    });

    toast.success('💾 Survey saved offline - Will sync when online');
    await updateStorageStats();
    resetForm();
    setActiveTab('list');
  };

  const autoSyncPendingSurveys = async () => {
    if (!online || !coordinator) return;

    setSyncing(true);
    try {
      const pending = await getPendingSurveys();
      
      if (pending.length === 0) {
        return;
      }

      toast.info(`🔄 Syncing ${pending.length} pending surveys...`);

      let successCount = 0;
      for (const survey of pending) {
        try {
          // Upload photo if exists
          let photoUrl = null;
          if (survey.photoBlob) {
            const photoPath = `survey-photos/${survey.coordinatorId}-${Date.now()}.jpg`;
            const { error: photoError } = await supabase.storage
              .from('swastha-documents')
              .upload(photoPath, survey.photoBlob);

            if (!photoError) {
              const { data: { publicUrl } } = supabase.storage
                .from('swastha-documents')
                .getPublicUrl(photoPath);
              photoUrl = publicUrl;
            }
          }

          // Upload video
          const videoPath = `survey-videos/${survey.coordinatorId}-${Date.now()}.webm`;
          const { error: videoError } = await supabase.storage
            .from('swastha-documents')
            .upload(videoPath, survey.videoBlob);

          if (videoError) throw videoError;

          const { data: { publicUrl: videoPublicUrl } } = supabase.storage
            .from('swastha-documents')
            .getPublicUrl(videoPath);

          // Insert to database
          const { error: insertError } = await supabase
            .from('panchayat_surveys')
            .insert({
              coordinator_id: survey.coordinatorId,
              state: survey.formData.state,
              district: survey.formData.district,
              block_panchayat: survey.formData.block_panchayat,
              village: survey.formData.village,
              pincode: survey.formData.pincode,
              woman_name: survey.formData.woman_name,
              woman_age: parseInt(survey.formData.woman_age),
              woman_mobile: survey.formData.woman_mobile || null,
              pad_usage: survey.formData.pad_usage,
              awareness_level: survey.formData.awareness_level,
              photo_url: photoUrl,
              video_url: videoPublicUrl,
            });

          if (insertError) throw insertError;

          await markAsSynced(survey.id);
          successCount++;
        } catch (error) {
          console.error('Sync error for survey:', survey.id, error);
        }
      }

      toast.success(`✓ Synced ${successCount} of ${pending.length} surveys`);
      await updateStorageStats();
    } catch (error) {
      console.error('Auto sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const resetForm = () => {
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
    setLocation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Status Bar */}
      <div className={`sticky top-0 z-50 ${online ? 'bg-green-600' : 'bg-orange-600'} text-white px-4 py-2 flex items-center justify-between shadow-lg`}>
        <div className="flex items-center space-x-2">
          {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span className="text-sm font-semibold">{online ? 'Online' : 'Offline Mode'}</span>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          {syncing && <Loader2 className="h-4 w-4 animate-spin" />}
          <div className="flex items-center space-x-1">
            <Database className="h-3 w-3" />
            <span>{storageStats.pending} pending</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-2xl shadow-lg">
              <h1 className="text-2xl font-bold mb-2">Survey App</h1>
              <p className="text-pink-100">Welcome, {coordinator?.full_name}</p>
              <p className="text-sm text-pink-200 mt-1">{coordinator?.coordinator_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{storageStats.total}</p>
                <p className="text-sm text-gray-600">Total Surveys</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <CloudUpload className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{storageStats.pending}</p>
                <p className="text-sm text-gray-600">Pending Sync</p>
              </div>
            </div>

            <Button
              onClick={() => setActiveTab('survey')}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white h-14 text-lg font-bold rounded-xl shadow-lg"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start New Survey
            </Button>

            {storageStats.pending > 0 && online && (
              <Button
                onClick={autoSyncPendingSurveys}
                disabled={syncing}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl"
              >
                <Upload className="h-5 w-5 mr-2" />
                {syncing ? 'Syncing...' : `Sync ${storageStats.pending} Surveys`}
              </Button>
            )}
          </div>
        )}

        {/* Survey Tab */}
        {activeTab === 'survey' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-pink-600" />
                Location
              </h3>
              <div className="space-y-3">
                <Input
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="गाँव का नाम *"
                  required
                  className="h-12"
                />
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode *"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  className="h-12"
                />
                <Button
                  type="button"
                  onClick={captureLocation}
                  variant="outline"
                  className="w-full h-12 border-pink-300 text-pink-600"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {location ? `Location Captured (±${Math.round(location.accuracy)}m)` : 'Capture GPS Location'}
                </Button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-pink-600" />
                Woman Details
              </h3>
              <div className="space-y-3">
                <Input
                  value={formData.woman_name}
                  onChange={(e) => setFormData({ ...formData, woman_name: e.target.value })}
                  placeholder="महिला का नाम *"
                  required
                  className="h-12"
                />
                <Input
                  type="number"
                  value={formData.woman_age}
                  onChange={(e) => setFormData({ ...formData, woman_age: e.target.value })}
                  placeholder="Age *"
                  min="10"
                  max="100"
                  required
                  className="h-12"
                />
                <Input
                  value={formData.woman_mobile}
                  onChange={(e) => setFormData({ ...formData, woman_mobile: e.target.value })}
                  placeholder="Mobile (Optional)"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="h-12"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="font-bold text-gray-900 mb-3">Survey Questions</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pad Usage *</label>
                  <select
                    value={formData.pad_usage}
                    onChange={(e) => setFormData({ ...formData, pad_usage: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg h-12"
                  >
                    <option value="">Select</option>
                    <option value="yes_regular">Yes, Regular Use</option>
                    <option value="yes_occasional">Yes, Occasional Use</option>
                    <option value="no_never">No, Never Used</option>
                    <option value="prefer_not_say">Prefer Not to Say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Awareness Level *</label>
                  <select
                    value={formData.awareness_level}
                    onChange={(e) => setFormData({ ...formData, awareness_level: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg h-12"
                  >
                    <option value="">Select</option>
                    <option value="very_aware">Very Aware</option>
                    <option value="somewhat_aware">Somewhat Aware</option>
                    <option value="not_aware">Not Aware</option>
                    <option value="need_education">Need Education</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-pink-600" />
                Photo (Optional)
              </h3>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
                id="photo-capture"
              />
              <label
                htmlFor="photo-capture"
                className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg active:bg-pink-50"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="max-h-48 rounded" />
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Tap to capture photo</p>
                  </div>
                )}
              </label>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-pink-300">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Video className="h-5 w-5 mr-2 text-pink-600" />
                Video Recording * (30 sec)
              </h3>
              
              {!videoFile && !isRecording && (
                <Button
                  type="button"
                  onClick={startVideoRecording}
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-16 text-lg rounded-xl"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <div className="space-y-3">
                  <div className="bg-red-50 border-2 border-red-500 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="font-bold text-red-600">Recording...</span>
                      </div>
                      <span className="font-mono text-2xl font-bold text-red-600">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-3">
                      <div
                        className="bg-red-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(recordingTime / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={stopVideoRecording}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white h-14 rounded-xl"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              )}

              {videoFile && videoPreview && (
                <div className="space-y-3">
                  <div className="bg-green-50 border-2 border-green-500 p-4 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-center font-bold text-green-600">Video Recorded!</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                    variant="outline"
                    className="w-full h-12 border-red-300 text-red-600"
                  >
                    Record Again
                  </Button>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!videoFile || submitting}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white h-16 text-lg font-bold rounded-xl shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  {online ? 'Submit Survey' : 'Save Offline'}
                </>
              )}
            </Button>
          </form>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Stored Surveys</h2>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-center py-8 text-gray-500">
                <List className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Survey list coming soon</p>
                <p className="text-sm">{storageStats.total} surveys stored</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && coordinator && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{coordinator.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coordinator ID</p>
                  <p className="font-semibold font-mono">{coordinator.coordinator_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{coordinator.district}, {coordinator.state}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'home' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('survey')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'survey' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs font-medium">Survey</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              activeTab === 'list' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <List className="h-6 w-6" />
            <span className="text-xs font-medium">List</span>
            {storageStats.pending > 0 && (
              <span className="absolute top-1 right-6 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {storageStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'profile' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSurveyApp;
