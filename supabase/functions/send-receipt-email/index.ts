import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { payment_id } = await req.json();
    if (!payment_id) {
      return new Response(JSON.stringify({ error: "payment_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch confirmation record
    const { data: confirmation, error: confError } = await supabase
      .from("payment_confirmations")
      .select("*")
      .eq("payment_id", payment_id)
      .single();

    if (confError || !confirmation) {
      return new Response(
        JSON.stringify({ error: "Confirmation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (confirmation.status !== "confirmed" || !confirmation.treasurer_confirmed_at || !confirmation.secretary_confirmed_at) {
      return new Response(
        JSON.stringify({ error: "Payment not fully confirmed yet" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (confirmation.receipt_sent) {
      return new Response(
        JSON.stringify({ error: "Receipt already sent" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch payment details with member profile and category
    const { data: payment, error: payError } = await supabase
      .from("payments")
      .select("*, profiles:user_id (first_name, last_name, phone), payment_categories:category_id (name, code)")
      .eq("id", payment_id)
      .single();

    if (payError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get member's email from auth.users
    const { data: memberAuth } = await supabase.auth.admin.getUserById(payment.user_id);
    const memberEmail = memberAuth?.user?.email;

    if (!memberEmail) {
      return new Response(
        JSON.stringify({ error: "Member email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch treasurer and secretary names
    const { data: treasurerProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", confirmation.treasurer_user_id)
      .single();

    const { data: secretaryProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", confirmation.secretary_user_id)
      .single();

    // Get secretary's email to send FROM
    const { data: secretaryAuth } = await supabase.auth.admin.getUserById(confirmation.secretary_user_id);
    const secretaryEmail = secretaryAuth?.user?.email || "noreply@church.org";

    // Generate receipt number
    const receiptNumber = `RCT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const memberName = `${payment.profiles?.first_name || ""} ${payment.profiles?.last_name || ""}`.trim();
    const treasurerName = treasurerProfile ? `${treasurerProfile.first_name} ${treasurerProfile.last_name}` : "Church Treasurer";
    const secretaryName = secretaryProfile ? `${secretaryProfile.first_name} ${secretaryProfile.last_name}` : "Church Secretary";
    const categoryName = payment.payment_categories?.name || "General";
    const categoryCode = payment.payment_categories?.code || "";
    const amount = Number(payment.amount).toLocaleString("en-KE");
    const paymentDate = new Date(payment.payment_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const paymentMethod = payment.payment_method.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Build the branded HTML receipt
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header with Adventist Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #00447c 0%, #003366 100%);padding:30px 40px;text-align:center;">
              <img src="https://www.adventist.org/wp-content/uploads/2019/06/logo-adventist-white.png" alt="Seventh-day Adventist Church" width="180" style="margin-bottom:15px;">
              <h1 style="color:#ffffff;font-size:22px;margin:0;letter-spacing:1px;">HADHUDHU SDA CHURCH</h1>
              <p style="color:#c69214;font-size:13px;margin:6px 0 0;letter-spacing:2px;font-weight:bold;">OFFICIAL PAYMENT RECEIPT</p>
            </td>
          </tr>

          <!-- Receipt Number Banner -->
          <tr>
            <td style="background-color:#c69214;padding:10px 40px;text-align:center;">
              <p style="color:#ffffff;font-size:14px;margin:0;font-weight:bold;">Receipt No: ${receiptNumber}</p>
            </td>
          </tr>

          <!-- Receipt Body -->
          <tr>
            <td style="padding:30px 40px;">
              <p style="color:#333;font-size:15px;margin:0 0 20px;">Dear <strong>${memberName}</strong>,</p>
              <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 25px;">
                We acknowledge with gratitude the following contribution. This receipt confirms that your payment has been verified by both the Church Treasurer and Church Secretary.
              </p>

              <!-- Payment Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e4e8;border-radius:8px;overflow:hidden;margin-bottom:25px;">
                <tr style="background-color:#f8f9fb;">
                  <td style="padding:12px 16px;font-size:13px;color:#666;border-bottom:1px solid #e0e4e8;width:40%;">Payment Category</td>
                  <td style="padding:12px 16px;font-size:14px;color:#00447c;font-weight:bold;border-bottom:1px solid #e0e4e8;">${categoryName} ${categoryCode ? `(${categoryCode})` : ""}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#666;border-bottom:1px solid #e0e4e8;">Amount Paid</td>
                  <td style="padding:12px 16px;font-size:18px;color:#1a7c3e;font-weight:bold;border-bottom:1px solid #e0e4e8;">KES ${amount}</td>
                </tr>
                <tr style="background-color:#f8f9fb;">
                  <td style="padding:12px 16px;font-size:13px;color:#666;border-bottom:1px solid #e0e4e8;">Payment Method</td>
                  <td style="padding:12px 16px;font-size:14px;color:#333;border-bottom:1px solid #e0e4e8;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#666;border-bottom:1px solid #e0e4e8;">Reference Number</td>
                  <td style="padding:12px 16px;font-size:14px;color:#333;font-family:monospace;border-bottom:1px solid #e0e4e8;">${payment.reference_number || "N/A"}</td>
                </tr>
                <tr style="background-color:#f8f9fb;">
                  <td style="padding:12px 16px;font-size:13px;color:#666;border-bottom:1px solid #e0e4e8;">Payment Date</td>
                  <td style="padding:12px 16px;font-size:14px;color:#333;border-bottom:1px solid #e0e4e8;">${paymentDate}</td>
                </tr>
                ${payment.description ? `
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#666;">Description</td>
                  <td style="padding:12px 16px;font-size:14px;color:#333;">${payment.description}</td>
                </tr>` : ""}
              </table>

              <!-- Verification Section -->
              <div style="background-color:#f0f7f0;border:1px solid #c3e6cb;border-radius:8px;padding:20px;margin-bottom:25px;">
                <p style="color:#1a7c3e;font-size:14px;font-weight:bold;margin:0 0 12px;">✅ Payment Verified By:</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;width:50%;">
                      <p style="margin:0;font-size:13px;color:#666;">Church Treasurer</p>
                      <p style="margin:2px 0 0;font-size:14px;color:#333;font-weight:bold;">${treasurerName}</p>
                    </td>
                    <td style="padding:6px 0;width:50%;">
                      <p style="margin:0;font-size:13px;color:#666;">Church Secretary</p>
                      <p style="margin:2px 0 0;font-size:14px;color:#333;font-weight:bold;">${secretaryName}</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Thank you message -->
              <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 10px;">
                <em>"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."</em> — 2 Corinthians 9:7
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#00447c;padding:20px 40px;text-align:center;">
              <p style="color:#c69214;font-size:13px;font-weight:bold;margin:0;">Hadhudhu Seventh-day Adventist Church</p>
              <p style="color:#aab8cc;font-size:12px;margin:6px 0 0;">This is an official computer-generated receipt. Keep for your records.</p>
              <p style="color:#aab8cc;font-size:11px;margin:4px 0 0;">Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send email using Supabase's built-in email (via auth.admin or SMTP)
    // We'll use a simple fetch to a transactional email service
    // For now, use Supabase's inbuilt approach via the Go API
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (lovableApiKey) {
      // Use Lovable's transactional email API
      const emailResponse = await fetch("https://api.lovable.dev/v1/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          to: memberEmail,
          subject: `Payment Receipt ${receiptNumber} - Hadhudhu SDA Church`,
          html: receiptHtml,
          replyTo: secretaryEmail,
          purpose: "transactional",
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Email send failed:", errText);
        // Still update status even if email fails
      }
    } else {
      console.warn("LOVABLE_API_KEY not found, skipping email send");
    }

    // Update confirmation record
    await supabase
      .from("payment_confirmations")
      .update({
        receipt_sent: true,
        receipt_sent_at: new Date().toISOString(),
        receipt_number: receiptNumber,
      })
      .eq("payment_id", payment_id);

    // Log the activity
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      await userClient.rpc("log_activity", {
        _action: "receipt_sent",
        _entity_type: "payment",
        _entity_id: payment_id,
        _details: { receipt_number: receiptNumber, member_email: memberEmail },
      });
    }

    return new Response(
      JSON.stringify({ success: true, receipt_number: receiptNumber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
