import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting review reminder process...');

    // Fetch reminder settings
    const { data: settingsData } = await supabaseAdmin
      .from('incentive_settings')
      .select('setting_key, setting_value');

    const settings: Record<string, string> = {};
    settingsData?.forEach((s: any) => { settings[s.setting_key] = s.setting_value; });

    if (settings.reminder_enabled !== 'true') {
      return new Response(
        JSON.stringify({ message: 'Reminders are disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reminderDays = parseInt(settings.reminder_days || '7');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - reminderDays);

    // Find orders delivered >= reminderDays ago, where reminder not yet sent
    const { data: reminders, error: remindersError } = await supabaseAdmin
      .from('review_reminders')
      .select(`
        *,
        orders(id, order_number, order_status, updated_at, user_id),
        products(id, name, slug, images),
        user_profiles(id, username, email)
      `)
      .eq('reminder_sent', false)
      .eq('review_submitted', false)
      .lte('created_at', cutoffDate.toISOString());

    if (remindersError) {
      console.error('Fetch reminders error:', remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    let sentCount = 0;
    const resendKey = Deno.env.get('RESEND_API_KEY');

    for (const reminder of (reminders || [])) {
      const order = reminder.orders;
      const product = reminder.products;
      const userProfile = reminder.user_profiles;

      if (!order || !product || !userProfile?.email) continue;
      if (order.order_status !== 'delivered') continue;

      const userName = userProfile.username || 'Customer';
      const productImage = product.images?.[0] || '';
      const productUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.backend.onspace.ai', '.onspace.app') || 'https://desi-didi-mart.com'}/product/${product.slug}`;

      const discountText = settings.first_review_type === 'percentage'
        ? `${settings.first_review_value}% off`
        : `₹${settings.first_review_value} off`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .body { padding: 30px; }
            .product-card { display: flex; align-items: center; background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; gap: 16px; }
            .product-card img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
            .cta-button { display: inline-block; background: #f59e0b; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
            .incentive-box { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ How was your purchase?</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Order #${order.order_number}</p>
            </div>
            <div class="body">
              <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
              <p style="color: #6b7280; line-height: 1.6;">
                We hope you're enjoying your recent purchase! Your feedback helps thousands of other shoppers make informed decisions.
              </p>

              <div class="product-card">
                ${productImage ? `<img src="${productImage}" alt="${product.name}" />` : ''}
                <div>
                  <p style="font-weight: bold; color: #111827; margin: 0 0 4px;">${product.name}</p>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">Order #${order.order_number}</p>
                </div>
              </div>

              ${settings.first_review_enabled === 'true' ? `
              <div class="incentive-box">
                <div style="font-size: 20px; margin-bottom: 8px;">🎁</div>
                <p style="font-weight: bold; color: #065f46; margin: 0 0 4px;">Write a Review & Get ${discountText}!</p>
                <p style="color: #047857; font-size: 14px; margin: 0;">Submit your first review and receive an exclusive discount coupon instantly.</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin: 24px 0;">
                <a href="${productUrl}" class="cta-button">
                  ⭐ Write Your Review
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.6;">
                It only takes 2 minutes! Share your honest experience — what you loved, what could be better, and photos if you have them.
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this because you ordered from Desi Didi Mart.</p>
              <p>Desi Didi Mart - Meri Pahal Fast Help | © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      if (resendKey) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Desi Didi Mart <noreply@meripahal.com>',
            to: [userProfile.email],
            subject: `⭐ How was your purchase? - Order #${order.order_number}`,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          // Mark reminder as sent
          await supabaseAdmin
            .from('review_reminders')
            .update({
              reminder_sent: true,
              reminder_sent_at: new Date().toISOString(),
            })
            .eq('id', reminder.id);

          sentCount++;
          console.log(`Reminder sent to ${userProfile.email} for product ${product.name}`);
        } else {
          const emailError = await emailResponse.text();
          console.error(`Resend email error for ${userProfile.email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: sentCount,
        message: `${sentCount} reminder(s) sent` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Send reminder error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
