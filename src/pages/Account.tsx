import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import {
  User, Package, MapPin, Heart, Gift, LogOut, ChevronRight,
  Edit2, Save, X, Plus, Trash2, Star, Check, Truck,
  Clock, AlertCircle, RotateCcw, CheckCircle2, XCircle,
  ShoppingBag, Loader2, Phone, Home, Briefcase, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UserIncentives from '@/components/features/UserIncentives';

type Tab = 'overview' | 'orders' | 'addresses' | 'wishlist' | 'rewards';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  final_amount: number;
  discount_amount: number;
  delivery_charge: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  updated_at: string;
  shipping_address: {
    full_name: string;
    address_line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  order_items?: Array<{
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    variant: Record<string, string> | null;
  }>;
}

interface Address {
  id: string;
  full_name: string;
  mobile_number: string;
  pincode: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  address_type: string;
  is_default: boolean;
}

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    images: string[];
    average_rating: number;
    stock_quantity: number;
    is_active: boolean;
  };
}

const ORDER_STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const getStatusStep = (status: string) => {
  if (status === 'cancelled') return -1;
  return ORDER_STATUS_STEPS.findIndex(s => s.key === status);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'shipped': return 'bg-blue-100 text-blue-800';
    case 'processing': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-indigo-100 text-indigo-800';
    case 'placed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Jammu and Kashmir', 'Ladakh',
];

const Account = () => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Profile
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '', mobile_number: '', pincode: '', address_line1: '',
    address_line2: '', landmark: '', city: '', state: '', address_type: 'home',
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [removingWishlistId, setRemovingWishlistId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    setProfileName(user.username || '');
    setProfileEmail(user.email || '');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'wishlist') fetchWishlist();
  }, [activeTab, user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(id, product_name, product_image, quantity, price, variant)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch orders error:', error);
    } else {
      setOrders(data || []);
    }
    setLoadingOrders(false);
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Fetch addresses error:', error);
    } else {
      setAddresses(data || []);
    }
    setLoadingAddresses(false);
  };

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(id, name, slug, price, mrp, images, average_rating, stock_quantity, is_active)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch wishlist error:', error);
    } else {
      setWishlist(data || []);
    }
    setLoadingWishlist(false);
  };

  const saveProfile = async () => {
    if (!profileName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { username: profileName.trim() },
    });
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
      setEditingProfile(false);
    }
    setSavingProfile(false);
  };

  const openAddressDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        full_name: address.full_name,
        mobile_number: address.mobile_number,
        pincode: address.pincode,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        landmark: address.landmark || '',
        city: address.city,
        state: address.state,
        address_type: address.address_type,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        full_name: '', mobile_number: '', pincode: '', address_line1: '',
        address_line2: '', landmark: '', city: '', state: '', address_type: 'home',
      });
    }
    setAddressDialogOpen(true);
  };

  const saveAddress = async () => {
    const { full_name, mobile_number, pincode, address_line1, city, state } = addressForm;
    if (!full_name || !mobile_number || !pincode || !address_line1 || !city || !state) {
      toast.error('Please fill all required fields');
      return;
    }
    setSavingAddress(true);

    const payload = {
      ...addressForm,
      user_id: user!.id,
      is_default: addresses.length === 0,
    };

    let error;
    if (editingAddress) {
      ({ error } = await supabase.from('addresses').update(payload).eq('id', editingAddress.id));
    } else {
      ({ error } = await supabase.from('addresses').insert(payload));
    }

    if (error) {
      toast.error('Failed to save address');
    } else {
      toast.success(editingAddress ? 'Address updated' : 'Address added');
      setAddressDialogOpen(false);
      fetchAddresses();
    }
    setSavingAddress(false);
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete address');
    } else {
      toast.success('Address removed');
      fetchAddresses();
    }
  };

  const setDefaultAddress = async (id: string) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id);
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    if (error) {
      toast.error('Failed to set default');
    } else {
      toast.success('Default address updated');
      fetchAddresses();
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    setRemovingWishlistId(wishlistId);
    const { error } = await supabase.from('wishlist').delete().eq('id', wishlistId);
    if (error) {
      toast.error('Failed to remove from wishlist');
    } else {
      setWishlist(prev => prev.filter(w => w.id !== wishlistId));
      toast.success('Removed from wishlist');
    }
    setRemovingWishlistId(null);
  };

  const addToCart = async (productId: string) => {
    if (!user) return;
    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      product_id: productId,
      quantity: 1,
    });
    if (error && error.code === '23505') {
      toast.info('Already in cart');
    } else if (error) {
      toast.error('Failed to add to cart');
    } else {
      toast.success('Added to cart');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  const tabs = [
    { key: 'overview', label: 'Profile', icon: User },
    { key: 'orders', label: 'My Orders', icon: Package },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
    { key: 'rewards', label: 'Rewards', icon: Gift },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-trust-blue to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">
                  {(user.username || user.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user.username || 'My Account'}
                </h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-xl border overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${
                      isActive
                        ? 'border-trust-blue bg-blue-50 text-trust-blue'
                        : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-trust-blue' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}

              <div className="border-t">
                <Link
                  to="/shop"
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* ── PROFILE TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                    {!editingProfile ? (
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveProfile} disabled={savingProfile}>
                          {savingProfile ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Name</label>
                      {editingProfile ? (
                        <Input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Your name"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileName || '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email Address</label>
                      <p className="text-gray-900 font-medium py-2">{profileEmail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Orders', value: orders.length || '—', icon: Package, color: 'bg-blue-50 text-blue-600', action: () => setActiveTab('orders') },
                    { label: 'Addresses', value: addresses.length || '—', icon: MapPin, color: 'bg-green-50 text-green-600', action: () => setActiveTab('addresses') },
                    { label: 'Wishlist', value: wishlist.length || '—', icon: Heart, color: 'bg-pink-50 text-pink-600', action: () => setActiveTab('wishlist') },
                    { label: 'Rewards', value: 'View', icon: Gift, color: 'bg-yellow-50 text-yellow-600', action: () => setActiveTab('rewards') },
                  ].map((stat) => (
                    <button
                      key={stat.label}
                      onClick={stat.action}
                      className="bg-white rounded-xl border p-4 text-left hover:shadow-md transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </button>
                  ))}
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">Account Security</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Keep your account secure. Your login is managed through our secure authentication system.
                  </p>
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Your account is protected</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
                  <Link to="/shop">
                    <Button variant="outline" size="sm">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Shop More
                    </Button>
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-xl border p-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                    <Link to="/shop">
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const stepIndex = getStatusStep(order.order_status);
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
                        {/* Order Header */}
                        <div
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                            {order.order_items?.[0]?.product_image ? (
                              <img
                                src={order.order_items[0].product_image}
                                alt={order.order_items[0].product_name}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-7 w-7 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                Order #{order.order_number}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''} · ₹{order.final_amount.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(order.order_status)}`}>
                              {order.order_status === 'cancelled' ? (
                                <span className="flex items-center">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Cancelled
                                </span>
                              ) : order.order_status}
                            </span>
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Order Status Timeline */}
                        {isExpanded && (
                          <div className="border-t px-4 pb-4 pt-4">
                            {order.order_status !== 'cancelled' && (
                              <div className="mb-5 overflow-x-auto pb-2">
                                <div className="flex items-center min-w-max">
                                  {ORDER_STATUS_STEPS.map((step, idx) => {
                                    const StepIcon = step.icon;
                                    const isCompleted = idx <= stepIndex;
                                    const isCurrent = idx === stepIndex;
                                    return (
                                      <div key={step.key} className="flex items-center">
                                        <div className={`flex flex-col items-center ${isCurrent ? 'scale-110' : ''}`}>
                                          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                            isCompleted
                                              ? 'bg-trust-blue text-white shadow-md'
                                              : 'bg-gray-100 text-gray-400'
                                          }`}>
                                            <StepIcon className="h-4 w-4" />
                                          </div>
                                          <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                                            isCompleted ? 'text-trust-blue' : 'text-gray-400'
                                          }`}>
                                            {step.label}
                                          </span>
                                        </div>
                                        {idx < ORDER_STATUS_STEPS.length - 1 && (
                                          <div className={`h-0.5 w-10 mx-1 rounded flex-shrink-0 ${
                                            idx < stepIndex ? 'bg-trust-blue' : 'bg-gray-200'
                                          }`} />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {order.order_status === 'cancelled' && (
                              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <span className="text-sm text-red-700 font-medium">This order has been cancelled.</span>
                              </div>
                            )}

                            {/* Items List */}
                            <div className="space-y-3 mb-4">
                              {order.order_items?.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                                  {item.product_image ? (
                                    <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded object-cover" />
                                  ) : (
                                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product_name}</p>
                                    {item.variant && Object.keys(item.variant).length > 0 && (
                                      <p className="text-xs text-gray-500">
                                        {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t pt-3 space-y-1.5 text-sm">
                              <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{order.total_amount.toLocaleString()}</span>
                              </div>
                              {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount</span>
                                  <span>-₹{order.discount_amount.toLocaleString()}</span>
                                </div>
                              )}
                              {order.delivery_charge > 0 && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Delivery</span>
                                  <span>₹{order.delivery_charge.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
                                <span>Total Paid</span>
                                <span>₹{order.final_amount.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Payment Info */}
                            <div className="flex items-center justify-between mt-3 bg-gray-50 rounded-lg p-3">
                              <span className="text-xs text-gray-600">
                                Payment: <strong className="text-gray-800 capitalize">{order.payment_method.replace(/_/g, ' ')}</strong>
                              </span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.payment_status}
                              </span>
                            </div>

                            {/* Shipping Address */}
                            {order.shipping_address && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Delivered to:</p>
                                <p className="text-sm text-gray-800 font-medium">{order.shipping_address.full_name}</p>
                                <p className="text-xs text-gray-600">
                                  {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── ADDRESSES TAB ── */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                  <Button size="sm" onClick={() => openAddressDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white rounded-xl border p-12 text-center">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No Addresses Saved</h3>
                    <p className="text-gray-500 mb-6">Add a delivery address to speed up checkout</p>
                    <Button onClick={() => openAddressDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`bg-white rounded-xl border-2 p-5 relative ${
                        addr.is_default ? 'border-trust-blue' : 'border-gray-200'
                      }`}>
                        {addr.is_default && (
                          <span className="absolute top-3 right-3 bg-trust-blue text-white text-xs font-bold px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}

                        <div className="flex items-center space-x-2 mb-3">
                          {addr.address_type === 'work' ? (
                            <Briefcase className="h-4 w-4 text-gray-400" />
                          ) : addr.address_type === 'other' ? (
                            <MapPin className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Home className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            {addr.address_type}
                          </span>
                        </div>

                        <p className="font-bold text-gray-900 mb-1">{addr.full_name}</p>
                        <p className="text-sm text-gray-600 mb-0.5">{addr.address_line1}</p>
                        {addr.address_line2 && <p className="text-sm text-gray-600 mb-0.5">{addr.address_line2}</p>}
                        {addr.landmark && <p className="text-sm text-gray-500 mb-0.5">Near: {addr.landmark}</p>}
                        <p className="text-sm text-gray-700 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          {addr.mobile_number}
                        </div>

                        <div className="flex gap-2 mt-4">
                          {!addr.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAddressDialog(addr)}
                            className="text-xs"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAddress(addr.id)}
                            className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    My Wishlist <span className="text-sm font-normal text-gray-500">({wishlist.length})</span>
                  </h2>
                  <Link to="/shop">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add More
                    </Button>
                  </Link>
                </div>

                {loadingWishlist ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="bg-white rounded-xl border p-12 text-center">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-500 mb-6">Save products you love for easy access later</p>
                    <Link to="/shop">
                      <Button>Explore Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => {
                      const product = item.products;
                      if (!product) return null;
                      const discount = product.mrp > product.price
                        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                        : 0;

                      return (
                        <div key={item.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all group">
                          <div className="relative">
                            <Link to={`/product/${product.slug}`}>
                              <img
                                src={product.images?.[0] || 'https://via.placeholder.com/300'}
                                alt={product.name}
                                className="w-full h-44 object-cover group-hover:scale-105 transition-transform"
                              />
                            </Link>
                            {discount > 0 && (
                              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                {discount}% OFF
                              </span>
                            )}
                            {!product.is_active || product.stock_quantity === 0 ? (
                              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                Out of Stock
                              </span>
                            ) : null}
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              disabled={removingWishlistId === item.id}
                              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {removingWishlistId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          </div>

                          <div className="p-3">
                            <Link to={`/product/${product.slug}`}>
                              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 hover:text-trust-blue">
                                {product.name}
                              </h3>
                            </Link>

                            {product.average_rating > 0 && (
                              <div className="flex items-center space-x-1 mb-2">
                                <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                  {product.average_rating.toFixed(1)}
                                  <Star className="h-3 w-3 ml-0.5 fill-current" />
                                </div>
                              </div>
                            )}

                            <div className="flex items-baseline space-x-2 mb-3">
                              <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                              {product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 text-xs"
                                disabled={product.stock_quantity === 0 || !product.is_active}
                                onClick={() => addToCart(product.id)}
                              >
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Add to Cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-red-500 border-red-200 hover:bg-red-50 px-2"
                                onClick={() => removeFromWishlist(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── REWARDS TAB ── */}
            {activeTab === 'rewards' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">My Rewards</h2>
                <UserIncentives />

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <Gift className="h-5 w-5 text-yellow-600" />
                    <span>How to Earn More Rewards</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { step: '1', title: 'Buy a Product', desc: 'Shop from Desi Didi Mart' },
                      { step: '2', title: 'Write Your First Review', desc: 'Share your honest experience after delivery' },
                      { step: '3', title: 'Get an Exclusive Coupon', desc: 'Receive a discount coupon via email instantly' },
                      { step: '4', title: 'Bonus for Photo Reviews', desc: 'Upload photos/videos for an extra reward coupon' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start space-x-3">
                        <div className="w-7 h-7 bg-yellow-500 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/shop" className="mt-4 block">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold w-full">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Start Shopping to Earn Rewards
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <Input
                  value={addressForm.full_name}
                  onChange={(e) => setAddressForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                <Input
                  value={addressForm.mobile_number}
                  onChange={(e) => setAddressForm(f => ({ ...f, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address Line 1 *</label>
                <Input
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm(f => ({ ...f, address_line1: e.target.value }))}
                  placeholder="House/Flat no., Street"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address Line 2</label>
                <Input
                  value={addressForm.address_line2}
                  onChange={(e) => setAddressForm(f => ({ ...f, address_line2: e.target.value }))}
                  placeholder="Area, Colony (optional)"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Landmark</label>
                <Input
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm(f => ({ ...f, landmark: e.target.value }))}
                  placeholder="Near school, temple (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode *</label>
                <Input
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="6-digit pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                <Input
                  value={addressForm.city}
                  onChange={(e) => setAddressForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="City name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State *</label>
                <Select
                  value={addressForm.state}
                  onValueChange={(v) => setAddressForm(f => ({ ...f, state: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIA_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address Type</label>
                <Select
                  value={addressForm.address_type}
                  onValueChange={(v) => setAddressForm(f => ({ ...f, address_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAddress} disabled={savingAddress}>
              {savingAddress ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;
