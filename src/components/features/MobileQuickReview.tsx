import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SwasthaApplication } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Phone, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  applications: SwasthaApplication[];
  onUpdate: () => void;
}

const MobileQuickReview = ({ applications, onUpdate }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const currentApp = applications[currentIndex];

  if (!currentApp) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No applications to review</p>
      </div>
    );
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < applications.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowActions(false);
      setRejectionReason('');
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowActions(false);
      setRejectionReason('');
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('swastha_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', currentApp.id);

      if (error) throw error;

      toast.success('Application approved');
      onUpdate();
      
      // Move to next
      if (currentIndex < applications.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      setShowActions(false);
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error('Approval में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('कृपया rejection reason दें');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('swastha_applications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', currentApp.id);

      if (error) throw error;

      toast.success('Application rejected');
      onUpdate();
      
      // Move to next
      if (currentIndex < applications.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      setShowActions(false);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error('Rejection में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    applicant: 'Applicant',
    district_coordinator: 'District Coordinator',
    block_coordinator: 'Block Coordinator',
    panchayat_coordinator: 'Panchayat Coordinator',
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Counter */}
      <div className="bg-pink-600 text-white px-4 py-2 rounded-t-lg text-center font-semibold">
        {currentIndex + 1} of {applications.length}
      </div>

      {/* Application Card */}
      <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
        {/* Photo */}
        {currentApp.photo_url && (
          <img
            src={currentApp.photo_url}
            alt={currentApp.full_name}
            className="w-full h-64 object-cover"
          />
        )}

        {/* Details */}
        <div className="p-6 space-y-4">
          <div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              {currentApp.application_id}
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <User className="h-4 w-4" />
              <span className="text-sm font-semibold">Name</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{currentApp.full_name}</p>
            <p className="text-sm text-gray-600">{roleLabels[currentApp.role]}</p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-semibold">Contact</span>
            </div>
            <p className="text-gray-900">{currentApp.whatsapp_number}</p>
            <p className="text-sm text-gray-600">{currentApp.gmail_id}</p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-semibold">Location</span>
            </div>
            <p className="text-gray-900">
              {currentApp.block_panchayat && `${currentApp.block_panchayat}, `}
              {currentApp.district}, {currentApp.state}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Education</p>
            <p className="font-semibold text-gray-900">{currentApp.education}</p>
          </div>

          {currentApp.why_join && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Why Join?</p>
              <p className="text-sm text-gray-900">{currentApp.why_join}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
          <Button
            onClick={() => handleSwipe('right')}
            disabled={currentIndex === 0}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={() => setShowActions(!showActions)}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            Review
          </Button>

          <Button
            onClick={() => handleSwipe('left')}
            disabled={currentIndex === applications.length - 1}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Panel */}
        {showActions && (
          <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-t space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve
              </Button>

              <div className="space-y-2">
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Rejection reason (required for reject)"
                  rows={3}
                  className="text-sm"
                />
                <Button
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 h-12 text-lg"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileQuickReview;
