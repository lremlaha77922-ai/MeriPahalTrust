import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import {
  Gift, Copy, Clock, CheckCircle, Star, Image, Tag, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Incentive {
  id: string;
  user_id: string;
  review_id: string;
  coupon_code: string;
  incentive_type: 'first_review' | 'media_review';
  is_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  product_reviews?: {
    rating: number;
    title: string;
    products?: { name: string; slug: string };
  };
}

interface CouponDetails {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  valid_until: string;
  min_order_amount: number;
  used_count: number;
  usage_limit: number;
}

const UserIncentives = () => {
  const { user } = useAdmin();
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [couponDetails, setCouponDetails] = useState<Record<string, CouponDetails>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (user) {
      fetchIncentives();
    }
  }, [user]);

  const fetchIncentives = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('review_incentives')
      .select(`
        *,
        product_reviews(rating, title, products(name, slug))
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch incentives error:', error);
    } else if (data) {
      setIncentives(data);

      // Fetch coupon details for each incentive
      const codes = data.map(i => i.coupon_code);
      if (codes.length > 0) {
        const { data: coupons } = await supabase
          .from('coupons')
          .select('*')
          .in('code', codes);

        if (coupons) {
          const couponMap: Record<string, CouponDetails> = {};
          coupons.forEach(c => { couponMap[c.code] = c; });
          setCouponDetails(couponMap);
        }
      }
    }
    setLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied!`);
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getStatusBadge = (incentive: Incentive, coupon?: CouponDetails) => {
    if (incentive.is_claimed) {
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Used</Badge>;
    }
    if (coupon && isExpired(coupon.valid_until)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
  };

  const getDaysLeft = (validUntil: string) => {
    const diff = new Date(validUntil).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!user) return null;

  const activeIncentives = incentives.filter(i => {
    const coupon = couponDetails[i.coupon_code];
    return !i.is_claimed && coupon && !isExpired(coupon.valid_until);
  });

  const expiredOrUsed = incentives.filter(i => {
    const coupon = couponDetails[i.coupon_code];
    return i.is_claimed || !coupon || isExpired(coupon.valid_until);
  });

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Gift className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">My Review Rewards</h3>
            <p className="text-sm text-gray-500">
              {activeIncentives.length} active coupon{activeIncentives.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {activeIncentives.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
              {activeIncentives.length} available
            </span>
          )}
          {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
            </div>
          ) : incentives.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-semibold mb-1">No rewards yet</p>
              <p className="text-sm text-gray-500">
                Write a review to earn exclusive discount coupons!
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Active Coupons */}
              {activeIncentives.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Available Coupons
                  </h4>
                  <div className="space-y-3">
                    {activeIncentives.map((incentive) => {
                      const coupon = couponDetails[incentive.coupon_code];
                      const daysLeft = coupon ? getDaysLeft(coupon.valid_until) : 0;

                      return (
                        <div key={incentive.id} className="relative overflow-hidden border-2 border-dashed border-yellow-400 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {incentive.incentive_type === 'first_review' ? (
                                <Star className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <Image className="h-4 w-4 text-purple-600" />
                              )}
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {incentive.incentive_type === 'first_review' ? 'First Review Reward' : 'Media Review Bonus'}
                              </span>
                            </div>
                            {getStatusBadge(incentive, coupon)}
                          </div>

                          {coupon && (
                            <div className="text-2xl font-black text-gray-900 mb-1">
                              {coupon.discount_type === 'percentage'
                                ? `${coupon.discount_value}% OFF`
                                : `₹${coupon.discount_value} OFF`}
                            </div>
                          )}

                          {coupon?.min_order_amount > 0 && (
                            <p className="text-xs text-gray-600 mb-3">
                              Min. order ₹{coupon.min_order_amount}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="bg-white border border-yellow-300 rounded-lg px-3 py-2 flex items-center space-x-2">
                              <Tag className="h-3 w-3 text-yellow-600" />
                              <span className="font-mono font-bold text-sm text-gray-900 tracking-wider">
                                {incentive.coupon_code}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyCode(incentive.coupon_code)}
                              className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>

                          {coupon && (
                            <div className={`flex items-center space-x-1 mt-3 text-xs ${
                              daysLeft <= 7 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span>
                                {daysLeft > 0
                                  ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                                  : 'Expires today'}
                              </span>
                            </div>
                          )}

                          {incentive.product_reviews?.products?.name && (
                            <p className="text-xs text-gray-500 mt-1">
                              For reviewing: {incentive.product_reviews.products.name}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Used/Expired */}
              {expiredOrUsed.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-4">
                    Used / Expired
                  </h4>
                  <div className="space-y-2">
                    {expiredOrUsed.map((incentive) => {
                      const coupon = couponDetails[incentive.coupon_code];
                      return (
                        <div key={incentive.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-60">
                          <div className="flex items-center space-x-3">
                            {incentive.is_claimed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-400" />
                            )}
                            <div>
                              <span className="font-mono text-sm text-gray-600 line-through">
                                {incentive.coupon_code}
                              </span>
                              {coupon && (
                                <div className="text-xs text-gray-400">
                                  {coupon.discount_type === 'percentage'
                                    ? `${coupon.discount_value}% off`
                                    : `₹${coupon.discount_value} off`}
                                </div>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(incentive, coupon)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserIncentives;
