import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const generateCouponCode = (prefix: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { review_id } = await req.json();
    console.log('Generating coupon for review:', review_id);

    if (!review_id) {
      return new Response(
        JSON.stringify({ error: 'review_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch review with user data
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('product_reviews')
      .select('*, user_profiles(id, username, email)')
      .eq('id', review_id)
      .single();

    if (reviewError || !review) {
      console.error('Review fetch error:', reviewError);
      return new Response(
        JSON.stringify({ error: 'Review not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch incentive settings
    const { data: settingsData } = await supabaseAdmin
      .from('incentive_settings')
      .select('setting_key, setting_value');

    const settings: Record<string, string> = {};
    settingsData?.forEach(s => { settings[s.setting_key] = s.setting_value; });

    const couponsToGenerate: Array<{
      type: string;
      discount_type: string;
      discount_value: number;
      expiry_days: number;
    }> = [];

    // Check if this is user's first review
    const { count: existingReviews } = await supabaseAdmin
      .from('review_incentives')
      .select('id', { count: 'exact' })
      .eq('user_id', review.user_id)
      .eq('incentive_type', 'first_review');

    if (settings.first_review_enabled === 'true' && (existingReviews ?? 0) === 0) {
      couponsToGenerate.push({
        type: 'first_review',
        discount_type: settings.first_review_type || 'percentage',
        discount_value: parseFloat(settings.first_review_value || '10'),
        expiry_days: parseInt(settings.first_review_expiry_days || '30'),
      });
    }

    // Check if review has media (photos/videos)
    const hasMedia = (review.images && review.images.length > 0) || 
                     (review.videos && review.videos.length > 0);

    const { count: existingMediaIncentives } = await supabaseAdmin
      .from('review_incentives')
      .select('id', { count: 'exact' })
      .eq('user_id', review.user_id)
      .eq('incentive_type', 'media_review');

    if (settings.media_review_enabled === 'true' && hasMedia && (existingMediaIncentives ?? 0) === 0) {
      couponsToGenerate.push({
        type: 'media_review',
        discount_type: settings.media_review_type || 'fixed',
        discount_value: parseFloat(settings.media_review_value || '25'),
        expiry_days: parseInt(settings.media_review_expiry_days || '60'),
      });
    }

    const generatedCoupons: string[] = [];

    for (const couponConfig of couponsToGenerate) {
      const couponCode = generateCouponCode('REVIEW');
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + couponConfig.expiry_days);

      // Create coupon in coupons table
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from('coupons')
        .insert({
          code: couponCode,
          description: couponConfig.type === 'first_review'
            ? `First Review Reward - Thank you for reviewing!`
            : `Media Review Bonus - Thanks for sharing photos/videos!`,
          discount_type: couponConfig.discount_type,
          discount_value: couponConfig.discount_value,
          min_order_amount: parseFloat(settings.min_order_for_coupon || '0'),
          usage_limit: 1,
          valid_from: new Date().toISOString(),
          valid_until: expiryDate.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (couponError) {
        console.error('Coupon creation error:', couponError);
        continue;
      }

      // Record incentive
      const { error: incentiveError } = await supabaseAdmin
        .from('review_incentives')
        .insert({
          user_id: review.user_id,
          review_id: review.id,
          coupon_code: couponCode,
          incentive_type: couponConfig.type,
          is_claimed: false,
        });

      if (incentiveError) {
        console.error('Incentive record error:', incentiveError);
        continue;
      }

      generatedCoupons.push(couponCode);

      // Send email notification via Resend
      const userEmail = review.user_profiles?.email;
      const userName = review.user_profiles?.username || 'Customer';

      if (userEmail) {
        const discountText = couponConfig.discount_type === 'percentage'
          ? `${couponConfig.discount_value}% off`
          : `₹${couponConfig.discount_value} off`;

        const emailSubject = couponConfig.type === 'first_review'
          ? '🎉 Your First Review Reward is Here!'
          : '📸 Thanks for the Photo Review - Bonus Coupon Inside!';

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a56db 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; }
              .body { padding: 30px; }
              .coupon-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px dashed #f59e0b; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
              .coupon-code { font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #92400e; font-family: monospace; }
              .coupon-desc { font-size: 16px; color: #78350f; margin-top: 8px; }
              .cta-button { display: inline-block; background: #1a56db; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 20px; }
              .footer { background: #f3f4f6; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${couponConfig.type === 'first_review' ? '🎉 Review Reward!' : '📸 Media Review Bonus!'}</h1>
                <p>Desi Didi Mart - Thank You for Your Review</p>
              </div>
              <div class="body">
                <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
                <p style="color: #6b7280; line-height: 1.6;">
                  ${couponConfig.type === 'first_review'
                    ? 'Thank you for submitting your first review on Desi Didi Mart! As a special thank-you, here\'s an exclusive discount coupon just for you:'
                    : 'Your review with photos/videos is amazing! Thank you for going the extra mile to help other shoppers. Here\'s a bonus coupon as our appreciation:'}
                </p>
                
                <div class="coupon-box">
                  <div style="font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Your Exclusive Coupon</div>
                  <div class="coupon-code">${couponCode}</div>
                  <div class="coupon-desc"><strong>${discountText}</strong> on your next order</div>
                  <div style="font-size: 12px; color: #92400e; margin-top: 8px;">Valid until ${expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>

                <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h4 style="margin: 0 0 8px; color: #1e40af;">How to use:</h4>
                  <ol style="margin: 0; padding-left: 20px; color: #3b82f6; line-height: 1.8;">
                    <li>Shop on Desi Didi Mart</li>
                    <li>Add items to your cart</li>
                    <li>Enter code <strong>${couponCode}</strong> at checkout</li>
                    <li>Enjoy your ${discountText} discount!</li>
                  </ol>
                </div>

                <div style="text-align: center;">
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('.backend.onspace.ai', '.onspace.app') || 'https://desi-didi-mart.com'}/shop" class="cta-button">
                    Shop Now →
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>This coupon is valid for single use only and expires on ${expiryDate.toLocaleDateString()}.</p>
                <p>Desi Didi Mart - Meri Pahal Fast Help | © ${new Date().getFullYear()}</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (resendKey) {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Desi Didi Mart <noreply@meripahal.com>',
              to: [userEmail],
              subject: emailSubject,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            const emailError = await emailResponse.text();
            console.error('Resend email error:', emailError);
          } else {
            console.log(`Email sent to ${userEmail} for ${couponConfig.type} incentive`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        coupons_generated: generatedCoupons,
        message: `${generatedCoupons.length} coupon(s) generated` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Generate coupon error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
