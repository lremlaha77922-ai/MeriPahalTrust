import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Gift, Settings, BarChart3, Mail, Save, RefreshCw, Toggle,
  Percent, DollarSign, Clock, Users, TrendingUp, CheckCircle,
  AlertCircle, Star, Image, ArrowRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface IncentiveSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_label: string;
  description: string;
  updated_by: string | null;
  updated_at: string;
}

interface IncentiveMetrics {
  totalCouponsGenerated: number;
  totalCouponsRedeemed: number;
  redemptionRate: number;
  reviewsWithIncentive: number;
  avgRatingWithIncentive: number;
  totalDiscountGiven: number;
}

const ReviewIncentives = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsData, setSettingsData] = useState<IncentiveSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<IncentiveMetrics | null>(null);
  const [incentivesList, setIncentivesList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'analytics' | 'coupons'>('settings');

  useEffect(() => {
    fetchSettings();
    fetchMetrics();
    fetchIncentivesList();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incentive_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      console.error('Fetch settings error:', error);
      toast.error('Failed to load settings');
    } else if (data) {
      setSettingsData(data);
      const settingsMap: Record<string, string> = {};
      data.forEach(s => { settingsMap[s.setting_key] = s.setting_value; });
      setSettings(settingsMap);
    }
    setLoading(false);
  };

  const fetchMetrics = async () => {
    const { data: incentives } = await supabase
      .from('review_incentives')
      .select('*, product_reviews(rating, images, videos)');

    if (!incentives) return;

    const { data: coupons } = await supabase
      .from('coupons')
      .select('*')
      .like('code', 'REVIEW%');

    const claimed = incentives.filter(i => i.is_claimed);
    const avgRating = incentives.length > 0
      ? incentives.reduce((sum, i) => sum + (i.product_reviews?.rating || 0), 0) / incentives.length
      : 0;

    setMetrics({
      totalCouponsGenerated: incentives.length,
      totalCouponsRedeemed: claimed.length,
      redemptionRate: incentives.length > 0 ? (claimed.length / incentives.length) * 100 : 0,
      reviewsWithIncentive: incentives.length,
      avgRatingWithIncentive: avgRating,
      totalDiscountGiven: claimed.length * (parseFloat(settings['first_review_value'] || '10')),
    });
  };

  const fetchIncentivesList = async () => {
    const { data } = await supabase
      .from('review_incentives')
      .select(`
        *,
        user_profiles(username, email),
        product_reviews(rating, title, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setIncentivesList(data);
  };

  const saveSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('incentive_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', key);

    if (error) {
      console.error('Save setting error:', error);
      return false;
    }
    return true;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let allSuccess = true;

    for (const [key, value] of Object.entries(settings)) {
      const success = await saveSetting(key, value);
      if (!success) allSuccess = false;
    }

    if (allSuccess) {
      toast.success('Settings saved successfully');
    } else {
      toast.error('Some settings failed to save');
    }
    setSaving(false);
  };

  const triggerReminders = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-review-reminder');
      if (error) throw error;
      toast.success('Review reminders sent successfully');
    } catch (err: any) {
      console.error('Trigger reminders error:', err);
      toast.error('Failed to send reminders');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Incentives</h1>
          <p className="text-gray-600 mt-1">Configure automated rewards for customer reviews</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={triggerReminders}>
            <Mail className="h-4 w-4 mr-2" />
            Send Reminders Now
          </Button>
          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Coupons Generated', value: metrics.totalCouponsGenerated, icon: Gift, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Redeemed', value: metrics.totalCouponsRedeemed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Redemption Rate', value: `${metrics.redemptionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Reviews Incentivized', value: metrics.reviewsWithIncentive, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Avg Rating', value: metrics.avgRatingWithIncentive.toFixed(1), icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Total Discount', value: `₹${metrics.totalDiscountGiven}`, icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((metric) => (
            <div key={metric.label} className={`${metric.bg} rounded-xl p-4 text-center`}>
              <metric.icon className={`h-6 w-6 ${metric.color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <div className="text-xs text-gray-600 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {[
          { key: 'settings', label: 'Settings', icon: Settings },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          { key: 'coupons', label: 'Issued Coupons', icon: Gift },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-trust-blue shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* First Review Incentive */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">First Review Incentive</h3>
                  <p className="text-sm text-gray-600">Reward users for their first review</p>
                </div>
              </div>
              <button
                onClick={() => setSettings(s => ({
                  ...s,
                  first_review_enabled: s.first_review_enabled === 'true' ? 'false' : 'true'
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.first_review_enabled === 'true' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.first_review_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className={`space-y-4 ${settings.first_review_enabled !== 'true' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type</label>
                <div className="flex gap-3">
                  {['percentage', 'fixed'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSettings(s => ({ ...s, first_review_type: type }))}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        settings.first_review_type === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type === 'percentage' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Value ({settings.first_review_type === 'percentage' ? '%' : '₹'})
                </label>
                <Input
                  type="number"
                  value={settings.first_review_value || ''}
                  onChange={(e) => setSettings(s => ({ ...s, first_review_value: e.target.value }))}
                  placeholder="10"
                  min="1"
                  max={settings.first_review_type === 'percentage' ? '100' : undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Coupon Valid For (days)
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={settings.first_review_expiry_days || ''}
                    onChange={(e) => setSettings(s => ({ ...s, first_review_expiry_days: e.target.value }))}
                    placeholder="30"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  Users submitting their first review receive a coupon for{' '}
                  <strong>
                    {settings.first_review_type === 'percentage'
                      ? `${settings.first_review_value}% off`
                      : `₹${settings.first_review_value} off`}
                  </strong>{' '}
                  valid for <strong>{settings.first_review_expiry_days} days</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Media Review Bonus */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Image className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Media Review Bonus</h3>
                  <p className="text-sm text-gray-600">Extra reward for photo/video reviews</p>
                </div>
              </div>
              <button
                onClick={() => setSettings(s => ({
                  ...s,
                  media_review_enabled: s.media_review_enabled === 'true' ? 'false' : 'true'
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.media_review_enabled === 'true' ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.media_review_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className={`space-y-4 ${settings.media_review_enabled !== 'true' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus Type</label>
                <div className="flex gap-3">
                  {['percentage', 'fixed'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSettings(s => ({ ...s, media_review_type: type }))}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        settings.media_review_type === type
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type === 'percentage' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bonus Value ({settings.media_review_type === 'percentage' ? '%' : '₹'})
                </label>
                <Input
                  type="number"
                  value={settings.media_review_value || ''}
                  onChange={(e) => setSettings(s => ({ ...s, media_review_value: e.target.value }))}
                  placeholder="25"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bonus Coupon Valid For (days)
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={settings.media_review_expiry_days || ''}
                    onChange={(e) => setSettings(s => ({ ...s, media_review_expiry_days: e.target.value }))}
                    placeholder="60"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-700">
                  Reviews with photos or videos earn a bonus coupon worth{' '}
                  <strong>
                    {settings.media_review_type === 'percentage'
                      ? `${settings.media_review_value}% off`
                      : `₹${settings.media_review_value} off`}
                  </strong>{' '}
                  valid for <strong>{settings.media_review_expiry_days} days</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Reminders</h3>
                  <p className="text-sm text-gray-600">Auto-send review requests after delivery</p>
                </div>
              </div>
              <button
                onClick={() => setSettings(s => ({
                  ...s,
                  reminder_enabled: s.reminder_enabled === 'true' ? 'false' : 'true'
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reminder_enabled === 'true' ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.reminder_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className={`space-y-4 ${settings.reminder_enabled !== 'true' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Days After Delivery to Send Reminder
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={settings.reminder_days || ''}
                    onChange={(e) => setSettings(s => ({ ...s, reminder_days: e.target.value }))}
                    placeholder="7"
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-700">
                  Automated email reminders are sent <strong>{settings.reminder_days} days</strong> after order delivery to customers who haven't left a review yet. Includes a personalized coupon offer.
                </p>
              </div>
            </div>
          </div>

          {/* Minimum Order Amount */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Coupon Restrictions</h3>
                <p className="text-sm text-gray-600">Set minimum order amount for coupons</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Order Amount (₹)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 font-semibold">₹</span>
                  <Input
                    type="number"
                    value={settings.min_order_for_coupon || ''}
                    onChange={(e) => setSettings(s => ({ ...s, min_order_for_coupon: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Set to 0 for no minimum order requirement</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-700">
                  Incentive coupons can only be used on orders above{' '}
                  <strong>₹{settings.min_order_for_coupon || 0}</strong>.
                  One coupon per user to prevent abuse.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-gray-900 mb-6">Incentive Conversion Funnel</h3>
          {incentivesList.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No incentive data yet. Start by approving reviews to generate coupons.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Reviews Submitted', count: incentivesList.length, color: 'bg-blue-500' },
                { label: 'Coupons Generated', count: incentivesList.length, color: 'bg-green-500' },
                { label: 'Coupons Claimed', count: incentivesList.filter(i => i.is_claimed).length, color: 'bg-purple-500' },
              ].map((step, idx) => (
                <div key={step.label} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-semibold text-gray-700 text-right">{step.label}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-8 ${step.color} rounded-full flex items-center justify-end pr-3 transition-all`}
                      style={{ width: `${Math.max(5, (step.count / Math.max(incentivesList.length, 1)) * 100)}%` }}
                    >
                      <span className="text-white text-sm font-bold">{step.count}</span>
                    </div>
                  </div>
                  {idx < 2 && <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-900">Issued Incentive Coupons</h3>
            <p className="text-sm text-gray-600">{incentivesList.length} coupons generated</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['User', 'Coupon Code', 'Type', 'Status', 'Review Date', 'Claimed At'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {incentivesList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      No coupons issued yet
                    </td>
                  </tr>
                ) : (
                  incentivesList.map((incentive) => (
                    <tr key={incentive.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {incentive.user_profiles?.username || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800">
                          {incentive.coupon_code}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={incentive.incentive_type === 'media_review' ? 'secondary' : 'default'}>
                          {incentive.incentive_type === 'media_review' ? 'Media Bonus' : 'First Review'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={incentive.is_claimed ? 'default' : 'outline'}>
                          {incentive.is_claimed ? '✓ Redeemed' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(incentive.product_reviews?.created_at || incentive.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {incentive.claimed_at ? new Date(incentive.claimed_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewIncentives;
