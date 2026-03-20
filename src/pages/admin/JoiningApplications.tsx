import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatIndianDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SwasthaApplication {
  id: string;
  application_id: string;
  role: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  age: number;
  gmail_id: string;
  whatsapp_number: string;
  state: string;
  district: string;
  block_panchayat: string;
  pincode: string;
  bpo_name: string;
  pco_name: string;
  education: string;
  photo_url: string;
  aadhar_front_url: string;
  aadhar_back_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  rejection_reason?: string;
  created_at: string;
}

const JoiningApplications = () => {
  const [applications, setApplications] = useState<SwasthaApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<SwasthaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'district_coordinator' | 'block_coordinator' | 'panchayat_coordinator'>('all');
  const [selectedApplication, setSelectedApplication] = useState<SwasthaApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, roleFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('swastha_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((app) => app.role === roleFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.whatsapp_number.includes(searchTerm) ||
          app.gmail_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
    setCurrentPage(1);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from('swastha_applications')
        .update({
          status,
          rejection_reason: rejectionReason || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Application ${status} successfully`);
      fetchApplications();
      setShowDetails(false);
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteApplication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const { error } = await supabase.from('swastha_applications').delete().eq('id', id);

      if (error) throw error;

      toast.success('Application deleted successfully');
      fetchApplications();
      setShowDetails(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete application');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Application ID',
      'Name',
      'Role',
      'Age',
      'Mobile',
      'Email',
      'State',
      'District',
      'Status',
      'Applied Date',
    ];

    const rows = filteredApplications.map((app) => [
      app.application_id,
      app.full_name,
      app.role,
      app.age,
      app.whatsapp_number,
      app.gmail_id,
      app.state,
      app.district,
      app.status,
      formatIndianDate(app.created_at),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swastha-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Swastha Sangini Applications</h1>
          <p className="text-gray-600 mt-1">Manage joining applications</p>
        </div>
        <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Total Applications</p>
          <p className="text-3xl font-bold text-trust-blue">{applications.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-amber-600">
            {applications.filter((a) => a.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-600">
            {applications.filter((a) => a.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-600">
            {applications.filter((a) => a.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, ID, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="district_coordinator">District Coordinator</SelectItem>
              <SelectItem value="block_coordinator">Block Coordinator</SelectItem>
              <SelectItem value="panchayat_coordinator">Panchayat Coordinator</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center text-sm text-gray-600">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredApplications.length)}{' '}
            of {filteredApplications.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-trust-blue">{app.application_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                    <div className="text-sm text-gray-500">{app.whatsapp_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.role.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{app.district}</div>
                    <div className="text-sm text-gray-500">{app.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatIndianDate(app.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(app.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) updateStatus(app.id, 'rejected', reason);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'bg-trust-blue' : ''}
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.application_id}</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Father's Name</p>
                    <p className="font-medium">{selectedApplication.father_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mother's Name</p>
                    <p className="font-medium">{selectedApplication.mother_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{selectedApplication.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Education</p>
                    <p className="font-medium">{selectedApplication.education}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium">{selectedApplication.role}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp Number</p>
                    <p className="font-medium">{selectedApplication.whatsapp_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gmail ID</p>
                    <p className="font-medium">{selectedApplication.gmail_id}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-medium">{selectedApplication.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-medium">{selectedApplication.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Block/Panchayat</p>
                    <p className="font-medium">{selectedApplication.block_panchayat}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pincode</p>
                    <p className="font-medium">{selectedApplication.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedApplication.photo_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Photo</p>
                      <img
                        src={selectedApplication.photo_url}
                        alt="Photo"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {selectedApplication.aadhar_front_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Aadhar Front</p>
                      <a
                        href={selectedApplication.aadhar_front_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-trust-blue underline"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {selectedApplication.aadhar_back_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Aadhar Back</p>
                      <a
                        href={selectedApplication.aadhar_back_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-trust-blue underline"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteApplication(selectedApplication.id)}
                >
                  Delete
                </Button>
                {selectedApplication.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => updateStatus(selectedApplication.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) updateStatus(selectedApplication.id, 'rejected', reason);
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JoiningApplications;
