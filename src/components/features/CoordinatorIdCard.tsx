import { Badge, CreditCard, MapPin, Phone, Mail, Calendar } from 'lucide-react';

interface CoordinatorIdCardProps {
  coordinatorId: string;
  fullName: string;
  coordinatorType: string;
  state: string;
  district: string;
  blockPanchayat?: string;
  mobileNumber: string;
  email: string;
  photoUrl?: string;
  appointedDate: string;
}

const CoordinatorIdCard = ({
  coordinatorId,
  fullName,
  coordinatorType,
  state,
  district,
  blockPanchayat,
  mobileNumber,
  email,
  photoUrl,
  appointedDate,
}: CoordinatorIdCardProps) => {
  const typeLabels = {
    district: 'District Coordinator',
    block: 'Block Coordinator',
    panchayat: 'Panchayat Coordinator',
  };

  const typeColors = {
    district: 'from-purple-600 to-purple-800',
    block: 'from-blue-600 to-blue-800',
    panchayat: 'from-green-600 to-green-800',
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-pink-200">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${typeColors[coordinatorType as keyof typeof typeColors]} text-white p-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 mr-2" />
            <span className="text-sm font-semibold">ID CARD</span>
          </div>
          <Badge className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold mb-1">स्वस्थ संगिनी कार्यक्रम</h2>
        <p className="text-sm opacity-90">{typeLabels[coordinatorType as keyof typeof typeLabels]}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Coordinator ID Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-400 rounded-lg px-6 py-3">
            <p className="text-xs text-gray-600 mb-1">Coordinator ID</p>
            <p className="text-2xl font-bold text-pink-900 tracking-wider">{coordinatorId}</p>
          </div>
        </div>

        {/* Photo and Name */}
        <div className="flex items-center mb-6">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="w-20 h-20 rounded-full border-4 border-pink-200 object-cover mr-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-pink-200 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mr-4">
              <span className="text-3xl font-bold text-pink-600">{fullName.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
            <p className="text-sm text-gray-600 capitalize">{coordinatorType} Level</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-pink-600 mr-3 mt-1 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <div className="font-semibold">{district}, {state}</div>
              {blockPanchayat && <div className="text-gray-600">{blockPanchayat}</div>}
            </div>
          </div>

          <div className="flex items-center">
            <Phone className="h-4 w-4 text-pink-600 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700">{mobileNumber}</span>
          </div>

          <div className="flex items-center">
            <Mail className="h-4 w-4 text-pink-600 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-700 break-all">{email}</span>
          </div>

          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-pink-600 mr-3 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Appointed: </span>
              {new Date(appointedDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-600">
            मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This is an official coordinator identification card
          </p>
        </div>
      </div>

      {/* Security Pattern */}
      <div className="h-2 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400"></div>
    </div>
  );
};

export default CoordinatorIdCard;
