import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Star, Check, X, Eye, MessageSquare, Filter, Calendar, User, Package,
  TrendingUp, AlertCircle, Shield, BarChart3, Search, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Gift } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  videos: string[];
  is_verified: boolean;
  helpful_count: number;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  user_profile?: {
    username: string;
    email: string;
  };
  product?: {
    name: string;
    slug: string;
    images: string[];
  };
  admin_response?: {
    response_text: string;
    created_at: string;
  };
}

interface Analytics {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
  verifiedPurchases: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
  topKeywords: Array<{ word: string; count: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const ReviewManagement = () => {
  const { user } = useAdmin();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    fetchReviews();
    fetchAnalytics();
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reviews, searchQuery, statusFilter, ratingFilter, verifiedFilter, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user_profile:user_profiles(username, email),
          product:products(name, slug, images),
          admin_response:review_responses(response_text, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Fetch reviews error:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: allReviews } = await supabase
        .from('product_reviews')
        .select('rating, is_verified, status, comment');

      if (!allReviews) return;

      const totalReviews = allReviews.length;
      const pendingReviews = allReviews.filter(r => r.status === 'pending').length;
      const approvedReviews = allReviews.filter(r => r.status === 'approved').length;
      const rejectedReviews = allReviews.filter(r => r.status === 'rejected').length;
      const verifiedPurchases = allReviews.filter(r => r.is_verified).length;
      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews || 0;

      // Rating distribution
      const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: allReviews.filter(r => r.rating === rating).length,
      }));

      // Extract keywords (simple word frequency)
      const words = allReviews
        .map(r => r.comment.toLowerCase())
        .join(' ')
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 4); // Filter out short words

      const wordFreq: Record<string, number> = {};
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      const topKeywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

      setAnalytics({
        totalReviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        averageRating,
        verifiedPurchases,
        ratingDistribution,
        topKeywords,
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        review =>
          review.comment.toLowerCase().includes(query) ||
          review.title?.toLowerCase().includes(query) ||
          review.user_profile?.username?.toLowerCase().includes(query) ||
          review.product?.name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Verified filter
    if (verifiedFilter !== 'all') {
      filtered = filtered.filter(review => 
        verifiedFilter === 'verified' ? review.is_verified : !review.is_verified
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-asc':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful-desc':
        filtered.sort((a, b) => b.helpful_count - a.helpful_count);
        break;
    }

    setFilteredReviews(filtered);
  };

  const approveReview = async () => {
    if (!selectedReview) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('product_reviews')
        .update({
          status: 'approved',
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedReview.id);

      if (error) throw error;

      // Trigger incentive coupon generation
      const { error: couponError } = await supabase.functions.invoke('generate-review-coupon', {
        body: { review_id: selectedReview.id },
      });
      if (couponError) {
        console.error('Coupon generation error:', couponError);
        // Don't block approval on coupon error
      }

      toast.success('Review approved and reward coupon sent!');
      setApproveDialogOpen(false);
      fetchReviews();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error('Failed to approve review');
    } finally {
      setSubmitting(false);
    }
  };

  const rejectReview = async () => {
    if (!selectedReview || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('product_reviews')
        .update({
          status: 'rejected',
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedReview.id);

      if (error) throw error;

      toast.success('Review rejected');
      setRejectDialogOpen(false);
      setRejectionReason('');
      fetchReviews();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error('Failed to reject review');
    } finally {
      setSubmitting(false);
    }
  };

  const submitResponse = async () => {
    if (!selectedReview || !adminResponse.trim()) {
      toast.error('Please write a response');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('review_responses')
        .upsert({
          review_id: selectedReview.id,
          admin_user_id: user!.id,
          response_text: adminResponse,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Response submitted successfully');
      setResponseDialogOpen(false);
      setAdminResponse('');
      fetchReviews();
    } catch (error: any) {
      console.error('Response error:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Rejected</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
              <p className="text-gray-600 mt-1">Moderate and manage customer reviews</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/review-incentives')}
              className="flex items-center space-x-2"
            >
              <Gift className="h-4 w-4" />
              <span>Incentive Settings</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard */}
      {analytics && (
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Review Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Star className="h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{analytics.averageRating.toFixed(1)}</h3>
                <p className="text-blue-100 text-sm">Average Rating</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{analytics.pendingReviews}</h3>
                <p className="text-yellow-100 text-sm">Pending Moderation</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Check className="h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{analytics.approvedReviews}</h3>
                <p className="text-green-100 text-sm">Approved Reviews</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{analytics.verifiedPurchases}</h3>
                <p className="text-purple-100 text-sm">Verified Purchases</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Keywords</h3>
                <div className="space-y-3">
                  {analytics.topKeywords.slice(0, 8).map((keyword, index) => (
                    <div key={keyword.word} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{keyword.word}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-trust-blue h-2 rounded-full"
                            style={{
                              width: `${(keyword.count / analytics.topKeywords[0].count) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{keyword.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search reviews, products, users..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Purchase Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="verified">Verified Purchases</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="rating-desc">Highest Rating</SelectItem>
                  <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                  <SelectItem value="helpful-desc">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-trust-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Star className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Reviews Found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {review.product?.images?.[0] && (
                      <img
                        src={review.product.images[0]}
                        alt={review.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {review.product?.name || 'Product'}
                      </h3>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {review.is_verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                        {getStatusBadge(review.status)}
                      </div>
                      
                      {review.title && (
                        <h4 className="font-semibold text-gray-800 mb-1">{review.title}</h4>
                      )}
                      
                      <p className="text-gray-700 line-clamp-3">{review.comment}</p>
                      
                      {(review.images?.length > 0 || review.videos?.length > 0) && (
                        <div className="flex gap-2 mt-3">
                          {review.images?.slice(0, 4).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review ${idx + 1}`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ))}
                          {review.videos?.length > 0 && (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {review.user_profile?.username || 'Anonymous'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {review.helpful_count} found helpful
                        </div>
                      </div>

                      {review.admin_response && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Admin Response:</p>
                          <p className="text-sm text-blue-800">{review.admin_response.response_text}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => {
                        setSelectedReview(review);
                        setDetailsOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>

                    {review.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => {
                            setSelectedReview(review);
                            setApproveDialogOpen(true);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedReview(review);
                            setRejectDialogOpen(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}

                    <Button
                      onClick={() => {
                        setSelectedReview(review);
                        setAdminResponse(review.admin_response?.response_text || '');
                        setResponseDialogOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Respond
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Review Details</SheetTitle>
          </SheetHeader>

          {selectedReview && (
            <div className="mt-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
                <p className="text-gray-700">{selectedReview.product?.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
                <p className="text-gray-700">{selectedReview.user_profile?.username}</p>
                <p className="text-sm text-gray-600">{selectedReview.user_profile?.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Rating & Review</h3>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < selectedReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {selectedReview.title && (
                  <h4 className="font-semibold text-gray-800 mb-2">{selectedReview.title}</h4>
                )}
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>

              {(selectedReview.images?.length > 0 || selectedReview.videos?.length > 0) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Media</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedReview.images?.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                {getStatusBadge(selectedReview.status)}
                {selectedReview.rejection_reason && (
                  <p className="text-sm text-red-600 mt-2">
                    Reason: {selectedReview.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this review? It will be publicly visible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={approveReview} disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting ? 'Approving...' : 'Approve Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this review.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="mt-2"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={rejectReview}
              disabled={submitting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Rejecting...' : 'Reject Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Write a professional response to address customer concerns.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label>Admin Response</Label>
            <Textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Your response to the customer..."
              className="mt-2"
              rows={6}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitResponse}
              disabled={submitting || !adminResponse.trim()}
              className="bg-trust-blue hover:bg-blue-700"
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewManagement;
