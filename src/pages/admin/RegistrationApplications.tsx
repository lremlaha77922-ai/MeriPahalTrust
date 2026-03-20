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
import { Employee } from '@/types';
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

const RegistrationApplications = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'terminated'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.mobile_number.includes(searchTerm) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const updateStatus = async (id: string, status: 'active' | 'terminated') => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Application ${status === 'active' ? 'approved' : 'rejected'} successfully`);
      fetchEmployees();
      setShowDetails(false);
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);

      if (error) throw error;

      toast.success('Application deleted successfully');
      fetchEmployees();
      setShowDetails(false);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete application');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Father/Husband Name',
      'DOB',
      'Mobile',
      'Email',
      'Education',
      'Status',
      'Joined Date',
    ];

    const rows = filteredEmployees.map((emp) => [
      emp.full_name,
      emp.father_husband_name,
      emp.date_of_birth,
      emp.mobile_number,
      emp.email || '',
      emp.education,
      emp.status,
      formatIndianDate(emp.created_at),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registration-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

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
          <h1 className="text-3xl font-bold text-gray-900">Registration Applications</h1>
          <p className="text-gray-600 mt-1">Manage employee registration forms</p>
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
          <p className="text-3xl font-bold text-trust-blue">{employees.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-amber-600">
            {employees.filter((e) => e.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-600">
            {employees.filter((e) => e.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-600">
            {employees.filter((e) => e.status === 'terminated').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, mobile, email..."
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
              <SelectItem value="active">Approved</SelectItem>
              <SelectItem value="terminated">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center text-sm text-gray-600">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of{' '}
            {filteredEmployees.length} results
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Education
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
              {currentItems.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                    <div className="text-sm text-gray-500">{employee.father_husband_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.mobile_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.education}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : employee.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.status === 'active'
                        ? 'Approved'
                        : employee.status === 'pending'
                        ? 'Pending'
                        : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatIndianDate(employee.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {employee.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(employee.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(employee.id, 'terminated')}
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
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedEmployee.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Father/Husband Name</p>
                    <p className="font-medium">{selectedEmployee.father_husband_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{selectedEmployee.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Education</p>
                    <p className="font-medium">{selectedEmployee.education}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mobile Number</p>
                    <p className="font-medium">{selectedEmployee.mobile_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alternate Mobile</p>
                    <p className="font-medium">{selectedEmployee.alternate_mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aadhar Number</p>
                    <p className="font-medium">{selectedEmployee.aadhar_number}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{selectedEmployee.full_address}</p>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-medium">{selectedEmployee.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-medium">{selectedEmployee.account_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="font-medium">{selectedEmployee.ifsc_code}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedEmployee.photo_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Photo</p>
                      <img
                        src={selectedEmployee.photo_url}
                        alt="Photo"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {selectedEmployee.aadhar_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Aadhar</p>
                      <a
                        href={selectedEmployee.aadhar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-trust-blue underline"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {selectedEmployee.signature_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Signature</p>
                      <img
                        src={selectedEmployee.signature_url}
                        alt="Signature"
                        className="w-full h-32 object-contain rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Button variant="destructive" onClick={() => deleteEmployee(selectedEmployee.id)}>
                  Delete
                </Button>
                {selectedEmployee.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => updateStatus(selectedEmployee.id, 'active')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateStatus(selectedEmployee.id, 'terminated')}
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

export default RegistrationApplications;
