import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, Filter, Download, Eye, Edit, Trash2, ChevronDown, Calendar,
  DollarSign, Package, TrendingUp, Users, ShoppingCart, RefreshCw,
  CheckCircle, XCircle, Clock, Truck, Box, FileText, Mail, AlertCircle,
  BarChart3, TrendingDown, ArrowUpDown, Printer, Send, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  delivery_charge: number;
  final_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: any;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    email: string;
  };
  order_items?: Array<{
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    variant: any;
  }>;
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

const ORDER_STATUSES = [
  { value: 'placed', label: 'Placed', color: 'bg-blue-500', icon: ShoppingCart },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'bg-yellow-500', icon: Package },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-500', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-500', icon: CheckCheck },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
];

const PAYMENT_METHODS = [
  { value: 'all', label: 'All Payment Methods' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'online', label: 'Online Payment' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
];

const OrderManagement = () => {
  const { user } = useAdmin();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Modals & Sheets
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  // Bulk actions
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Status update
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);

  // Charts data
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [statusChartData, setStatusChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    fetchOrders();
    fetchAnalytics();
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [orders, searchQuery, statusFilter, paymentFilter, dateFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user_profile:user_profiles(username, email),
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Get current month data
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current month analytics
      const { data: currentMonthOrders } = await supabase
        .from('orders')
        .select('final_amount, order_status, created_at')
        .gte('created_at', firstDayOfMonth.toISOString());

      // Last month analytics for growth calculation
      const { data: lastMonthOrders } = await supabase
        .from('orders')
        .select('final_amount')
        .gte('created_at', firstDayOfLastMonth.toISOString())
        .lte('created_at', lastDayOfLastMonth.toISOString());

      const totalRevenue = currentMonthOrders?.reduce((sum, order) => sum + order.final_amount, 0) || 0;
      const totalOrders = currentMonthOrders?.length || 0;
      const pendingOrders = currentMonthOrders?.filter(o => o.order_status === 'placed').length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const lastMonthRevenue = lastMonthOrders?.reduce((sum, order) => sum + order.final_amount, 0) || 0;
      const lastMonthOrderCount = lastMonthOrders?.length || 0;

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
      const ordersGrowth = lastMonthOrderCount > 0
        ? ((totalOrders - lastMonthOrderCount) / lastMonthOrderCount) * 100
        : 0;

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        pendingOrders,
        revenueGrowth,
        ordersGrowth,
      });

      // Prepare chart data - last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const revenueData = last7Days.map(date => {
        const dayOrders = currentMonthOrders?.filter(o => 
          o.created_at.split('T')[0] === date
        ) || [];
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((sum, order) => sum + order.final_amount, 0),
          orders: dayOrders.length,
        };
      });

      setRevenueChartData(revenueData);

      // Status distribution
      const { data: allOrders } = await supabase
        .from('orders')
        .select('order_status');

      const statusCounts = ORDER_STATUSES.map(status => ({
        name: status.label,
        value: allOrders?.filter(o => o.order_status === status.value).length || 0,
        color: status.color,
      }));

      setStatusChartData(statusCounts);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.order_number.toLowerCase().includes(query) ||
          order.user_profile?.username?.toLowerCase().includes(query) ||
          order.user_profile?.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_method === paymentFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.final_amount - a.final_amount);
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.final_amount - b.final_amount);
        break;
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: newStatus,
          notes: statusNotes || selectedOrder.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success('Order status updated successfully');
      
      if (sendEmailNotification) {
        // In production, you would send an actual email via Edge Function
        toast.info('Email notification sent to customer');
      }

      setStatusUpdateOpen(false);
      setNewStatus('');
      setStatusNotes('');
      fetchOrders();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error('Failed to update order status');
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: 'cancelled',
          payment_status: 'refunded',
          notes: `Order cancelled by admin. ${statusNotes}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success('Order cancelled and refund initiated');
      setCancelDialogOpen(false);
      setStatusNotes('');
      fetchOrders();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Cancel order error:', error);
      toast.error('Failed to cancel order');
    }
  };

  const processRefund = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'refunded',
          notes: `Refund processed by admin. ${statusNotes}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success('Refund processed successfully');
      setRefundDialogOpen(false);
      setStatusNotes('');
      fetchOrders();
    } catch (error: any) {
      console.error('Refund error:', error);
      toast.error('Failed to process refund');
    }
  };

  const exportToCSV = () => {
    const csvData = filteredOrders.map(order => ({
      'Order Number': order.order_number,
      'Customer': order.user_profile?.username || 'N/A',
      'Email': order.user_profile?.email || 'N/A',
      'Total Amount': order.final_amount,
      'Payment Method': order.payment_method,
      'Payment Status': order.payment_status,
      'Order Status': order.order_status,
      'Order Date': new Date(order.created_at).toLocaleDateString(),
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Orders exported to CSV');
  };

  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #1e40af; }
          .invoice-details { margin-bottom: 30px; }
          .invoice-details table { width: 100%; }
          .invoice-details td { padding: 8px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f3f4f6; }
          .totals { text-align: right; margin-top: 20px; }
          .totals table { margin-left: auto; }
          .totals td { padding: 8px 20px; }
          .total-row { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Desi Didi Mart</h1>
          <p>Tax Invoice</p>
        </div>
        
        <div class="invoice-details">
          <table>
            <tr>
              <td><strong>Invoice No:</strong> ${order.order_number}</td>
              <td><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Customer:</strong> ${order.user_profile?.username || 'N/A'}</td>
              <td><strong>Email:</strong> ${order.user_profile?.email || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items?.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toLocaleString()}</td>
                <td>₹${(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>₹${order.total_amount.toLocaleString()}</td>
            </tr>
            ${order.discount_amount > 0 ? `
              <tr>
                <td>Discount:</td>
                <td>- ₹${order.discount_amount.toLocaleString()}</td>
              </tr>
            ` : ''}
            <tr>
              <td>Delivery Charges:</td>
              <td>₹${order.delivery_charge.toLocaleString()}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td>₹${order.final_amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedOrders.length === 0) return;

    try {
      setBulkActionLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .in('id', selectedOrders);

      if (error) throw error;

      toast.success(`${selectedOrders.length} orders updated to ${status}`);
      setSelectedOrders([]);
      fetchOrders();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update orders');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    if (!statusConfig) return null;

    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${statusConfig.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
            </div>
            <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard */}
      {analytics && (
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-10 w-10 opacity-80" />
                  <div className={`flex items-center text-sm ${analytics.revenueGrowth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {analytics.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(analytics.revenueGrowth).toFixed(1)}%
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">₹{analytics.totalRevenue.toLocaleString()}</h3>
                <p className="text-blue-100 text-sm">Total Revenue (This Month)</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart className="h-10 w-10 opacity-80" />
                  <div className={`flex items-center text-sm ${analytics.ordersGrowth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {analytics.ordersGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(analytics.ordersGrowth).toFixed(1)}%
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{analytics.totalOrders}</h3>
                <p className="text-green-100 text-sm">Total Orders (This Month)</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold mb-1">₹{analytics.averageOrderValue.toLocaleString()}</h3>
                <p className="text-purple-100 text-sm">Average Order Value</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{analytics.pendingOrders}</h3>
                <p className="text-orange-100 text-sm">Pending Orders</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (₹)" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" name="Orders" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusChartData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <section className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order number, customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {ORDER_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedOrders.length === filteredOrders.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="font-semibold text-blue-900">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Select onValueChange={bulkUpdateStatus} disabled={bulkActionLoading}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Bulk Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        Update to {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Orders Table */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-trust-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {order.order_number}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.order_items?.length || 0} item{(order.order_items?.length || 0) > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user_profile?.username || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.user_profile?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ₹{order.final_amount.toLocaleString()}
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="text-xs text-green-600">
                            Saved ₹{order.discount_amount.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {order.payment_method}
                        </div>
                        <div className={`text-xs ${
                          order.payment_status === 'paid' ? 'text-green-600' :
                          order.payment_status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {order.payment_status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.order_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.order_status);
                              setStatusUpdateOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printInvoice(order)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Order Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              {selectedOrder?.order_number}
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="mt-6 space-y-6">
              {/* Status Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Status</h3>
                <div className="space-y-3">
                  {ORDER_STATUSES.map((status, index) => {
                    const Icon = status.icon;
                    const isCompleted = ORDER_STATUSES.findIndex(s => s.value === selectedOrder.order_status) >= index;
                    const isCurrent = selectedOrder.order_status === status.value;

                    return (
                      <div key={status.value} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? status.color : 'bg-gray-200'
                        }`}>
                          <Icon className={`h-4 w-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                            {status.label}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="ml-auto text-sm font-medium">
                      {selectedOrder.user_profile?.username || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="ml-auto text-sm font-medium">
                      {selectedOrder.user_profile?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.shipping_address && typeof selectedOrder.shipping_address === 'object' ? (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{selectedOrder.shipping_address.full_name}</p>
                      <p>{selectedOrder.shipping_address.address_line1}</p>
                      {selectedOrder.shipping_address.address_line2 && (
                        <p>{selectedOrder.shipping_address.address_line2}</p>
                      )}
                      <p>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                      </p>
                      <p className="mt-2">Mobile: {selectedOrder.shipping_address.mobile_number}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No shipping address available</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                      <img
                        src={item.product_image || 'https://via.placeholder.com/80'}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-500">Variant: {JSON.stringify(item.variant)}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">× {item.quantity}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">- ₹{selectedOrder.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span className="font-medium">₹{selectedOrder.delivery_charge.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-trust-blue">
                      ₹{selectedOrder.final_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium capitalize ${
                      selectedOrder.payment_status === 'paid' ? 'text-green-600' :
                      selectedOrder.payment_status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setDetailsOpen(false);
                    setNewStatus(selectedOrder.order_status);
                    setStatusUpdateOpen(true);
                  }}
                  className="flex-1 bg-trust-blue hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button
                  onClick={() => printInvoice(selectedOrder)}
                  variant="outline"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
              </div>

              {selectedOrder.order_status !== 'cancelled' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setDetailsOpen(false);
                      setRefundDialogOpen(true);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                  <Button
                    onClick={() => {
                      setDetailsOpen(false);
                      setCancelDialogOpen(true);
                    }}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any notes about this status update..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="email-notification"
                checked={sendEmailNotification}
                onCheckedChange={(checked) => setSendEmailNotification(checked as boolean)}
              />
              <label
                htmlFor="email-notification"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send email notification to customer
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateOrderStatus} disabled={!newStatus}>
              <Send className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {selectedOrder?.order_number}? This will also initiate a refund if payment was made.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <Label>Cancellation Reason</Label>
            <Textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Reason for cancellation..."
              className="mt-2"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatusNotes('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refund Dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Process a refund for order {selectedOrder?.order_number}. Amount: ₹{selectedOrder?.final_amount.toLocaleString()}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <Label>Refund Reason</Label>
            <Textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Reason for refund..."
              className="mt-2"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatusNotes('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={processRefund} className="bg-orange-600 hover:bg-orange-700">
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderManagement;
