import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { SwasthaCoordinator, PanchayatSurvey } from '@/types';
import { 
  Search, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  IdCard,
} from 'lucide-react';

const AdminCoordinatorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'mobile' | 'district' | 'block' | 'panchayat'>('id');
  const [coordinator, setCoordinator] = useState<SwasthaCoordinator | null>(null);
  const [surveys, setSurveys] = useState<PanchayatSurvey[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      let query = supabase.from('swastha_coordinators').select('*');

      if (searchType === 'id') {
        query = query.eq('coordinator_id', searchTerm.trim());
      } else if (searchType === 'mobile') {
        query = query.eq('mobile_number', searchTerm.trim());
      } else if (searchType === 'district') {
        query = query.ilike('district', `%${searchTerm.trim()}%`);
      } else if (searchType === 'block') {
        query = query.ilike('block_panchayat', `%${searchTerm.trim()}%`);
      } else if (searchType === 'panchayat') {
        query = query.ilike('block_panchayat', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query.limit(1).single();

      if (error) {
        if (error.code === 'PGRST116') {
          setCoordinator(null);
          setSurveys([]);
          return;
        }
        throw error;
      }

      setCoordinator(data);

      // Fetch surveys
      if (data.coordinator_id) {
        const { data: surveysData } = await supabase
          .from('panchayat_surveys')
          .select('*')
          .eq('coordinator_id', data.coordinator_id)
          .order('created_at', { ascending: false });

        setSurveys(surveysData || []);
      }

    } catch (error: any) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = coordinator ? {
    totalSurveys: surveys.length,
    verified: surveys.filter(s => s.status === 'verified').length,
    pending: surveys.filter(s => s.status === 'submitted').length,
    thisMonth: surveys.filter(s => {
      const surveyDate = new Date(s.created_at);
      const now = new Date();
      return surveyDate.getMonth() === now.getMonth() && surveyDate.getFullYear() === now.getFullYear();
    }).length,
  } : null;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2 text-pink-600" />
          Search Coordinator
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="id">Coordinator ID</option>
            <option value="mobile">Mobile Number</option>
            <option value="district">District</option>
            <option value="block">Block</option>
            <option value="panchayat">Panchayat</option>
          </select>
          <div className="md:col-span-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search by ${searchType}...`}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Coordinator Profile */}
      {coordinator && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  {coordinator.profile_photo_url ? (
                    <img src={coordinator.profile_photo_url} alt={coordinator.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{coordinator.full_name}</h3>
                  <p className="text-gray-600 capitalize">{coordinator.coordinator_type} Coordinator</p>
                  {coordinator.coordinator_id && (
                    <div className="mt-2 inline-flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <IdCard className="h-4 w-4 mr-1" />
                      {coordinator.coordinator_id}
                    </div>
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold ${
                coordinator.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {coordinator.is_active ? '✓ Active' : 'Inactive'}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Contact */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Contact
                </h4>
                <p className="text-gray-900 mb-1">{coordinator.mobile_number}</p>
                <p className="text-sm text-gray-600">{coordinator.email}</p>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </h4>
                <p className="text-gray-900">{coordinator.state}</p>
                <p className="text-sm text-gray-600">{coordinator.district}</p>
                {coordinator.block_panchayat && <p className="text-sm text-gray-600">{coordinator.block_panchayat}</p>}
                {coordinator.pincode && <p className="text-sm text-gray-600">PIN: {coordinator.pincode}</p>}
              </div>

              {/* Banking */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Banking
                </h4>
                <p className="text-gray-900">{coordinator.bank_name || 'Not added'}</p>
                <p className="text-sm text-gray-600">UPI: {coordinator.upi_id || 'Not added'}</p>
                <p className="text-sm text-gray-600">
                  A/c: {coordinator.account_number ? `****${coordinator.account_number.slice(-4)}` : 'Not added'}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                <FileText className="h-8 w-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Total Surveys</p>
                <p className="text-3xl font-bold">{stats.totalSurveys}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <CheckCircle className="h-8 w-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Verified</p>
                <p className="text-3xl font-bold">{stats.verified}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-lg shadow-lg">
                <Calendar className="h-8 w-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <TrendingUp className="h-8 w-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">This Month</p>
                <p className="text-3xl font-bold">{stats.thisMonth}</p>
              </div>
            </div>
          )}

          {/* Recent Surveys */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Surveys</h3>
            {surveys.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No surveys submitted yet</p>
            ) : (
              <div className="space-y-3">
                {surveys.slice(0, 10).map((survey) => (
                  <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{survey.woman_name}</p>
                      <p className="text-sm text-gray-600">{survey.village}, {survey.district}</p>
                      <p className="text-xs text-gray-500">{new Date(survey.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        survey.status === 'verified' ? 'bg-green-100 text-green-800' :
                        survey.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {survey.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!coordinator && !loading && searchTerm && (
        <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg text-center">
          <p className="text-yellow-800 font-semibold">No coordinator found with this search criteria</p>
        </div>
      )}
    </div>
  );
};

export default AdminCoordinatorSearch;
