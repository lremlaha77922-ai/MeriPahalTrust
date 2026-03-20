import { SwasthaApplication } from '@/types';
import { Button } from '@/components/ui/button';
import { X, User, Mail, Phone, MapPin, FileText, Calendar, CheckCircle, XCircle, Image } from 'lucide-react';
import { useState } from 'react';

interface Props {
  application: SwasthaApplication;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const SwasthaApplicationDetail = ({ application, onClose, onApprove, onReject }: Props) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('कृपया rejection reason दर्ज करें');
      return;
    }
    onReject(application.id, rejectionReason);
    setShowRejectModal(false);
  };

  const roleLabels = {
    applicant: 'Swastha Sangini Applicant',
    district_coordinator: 'District Coordinator',
    block_coordinator: 'Block Coordinator',
    panchayat_coordinator: 'Panchayat Coordinator',
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    under_review: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{application.full_name}</h2>
            <p className="text-pink-100">{application.application_id}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full font-semibold ${statusColors[application.status]}`}>
              {application.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              Applied: {new Date(application.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>

          {/* Role */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Applied Role</p>
            <p className="text-lg font-bold text-blue-900">{roleLabels[application.role]}</p>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-pink-600" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Father's Name</p>
                <p className="font-semibold text-gray-900">{application.father_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mother's Name</p>
                <p className="font-semibold text-gray-900">{application.mother_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold text-gray-900">{application.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Education</p>
                <p className="font-semibold text-gray-900">{application.education}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-pink-600" />
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Gmail ID</p>
                <p className="font-semibold text-gray-900">{application.gmail_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WhatsApp Number</p>
                <p className="font-semibold text-gray-900">{application.whatsapp_number}</p>
              </div>
              {application.facebook_profile && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Facebook Profile</p>
                  <a href={application.facebook_profile} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                    {application.facebook_profile}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-pink-600" />
              Address Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Full Address</p>
                <p className="font-semibold text-gray-900">{application.full_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-semibold text-gray-900">{application.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">District</p>
                <p className="font-semibold text-gray-900">{application.district}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Block/Panchayat</p>
                <p className="font-semibold text-gray-900">{application.block_panchayat}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pincode</p>
                <p className="font-semibold text-gray-900">{application.pincode}</p>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-pink-600" />
              Work Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">BPO Name</p>
                <p className="font-semibold text-gray-900">{application.bpo_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">PCO Name</p>
                <p className="font-semibold text-gray-900">{application.pco_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">UPI ID</p>
                <p className="font-semibold text-gray-900">{application.upi_id}</p>
              </div>
              {application.total_experience && (
                <div>
                  <p className="text-sm text-gray-600">Total Experience</p>
                  <p className="font-semibold text-gray-900">{application.total_experience}</p>
                </div>
              )}
              {application.ngo_work_experience && (
                <div>
                  <p className="text-sm text-gray-600">NGO Work Experience</p>
                  <p className="font-semibold text-gray-900">{application.ngo_work_experience}</p>
                </div>
              )}
            </div>
            {application.why_join && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Why Join</p>
                <p className="font-semibold text-gray-900">{application.why_join}</p>
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Image className="h-5 w-5 mr-2 text-pink-600" />
              Uploaded Documents
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Photo</p>
                <img 
                  src={application.photo_url} 
                  alt="Photo" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80"
                  onClick={() => setViewingImage(application.photo_url)}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Aadhaar Front</p>
                <img 
                  src={application.aadhar_front_url} 
                  alt="Aadhaar Front" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80"
                  onClick={() => setViewingImage(application.aadhar_front_url)}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Aadhaar Back</p>
                <img 
                  src={application.aadhar_back_url} 
                  alt="Aadhaar Back" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80"
                  onClick={() => setViewingImage(application.aadhar_back_url)}
                />
              </div>
            </div>
          </div>

          {/* Review Information */}
          {application.reviewed_at && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Review Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Reviewed By</p>
                  <p className="font-semibold text-gray-900">{application.reviewed_by || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reviewed Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(application.reviewed_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                {application.rejection_reason && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Rejection Reason</p>
                    <p className="font-semibold text-red-600">{application.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {application.status === 'pending' && (
            <div className="flex gap-4 pt-6 border-t">
              <Button
                onClick={() => onApprove(application.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Application
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="outline"
                className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Application
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Application</h3>
            <p className="text-gray-600 mb-4">कृपया rejection का कारण बताएं:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={4}
              placeholder="Rejection reason..."
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Rejection
              </Button>
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <img 
            src={viewingImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default SwasthaApplicationDetail;
