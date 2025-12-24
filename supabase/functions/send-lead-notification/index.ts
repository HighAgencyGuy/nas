import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = "skihyh@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeadNotificationRequest {
  name: string;
  email: string;
  phone: string;
  leadType: string;
  message: string;
}

const getLeadTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    general_inquiry: "General Inquiry",
    viewing_request: "Viewing Request",
    financing_request: "Financing Request",
    trade_in: "Trade-In Request",
    sell_car: "Sell Your Car",
  };
  return labels[type] || type;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, leadType, message }: LeadNotificationRequest = await req.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0;">Nas Autos</h1>
          <p style="color: #ffffff; margin-top: 10px;">New Lead Notification</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
            ${getLeadTypeLabel(leadType)}
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}" style="color: #d4af37;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <a href="tel:${phone}" style="color: #d4af37;">${phone}</a>
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">Message:</h3>
            <p style="margin: 0; color: #666; white-space: pre-wrap;">${message || "No message provided"}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://nasautos.com.ng/admin/leads" 
               style="display: inline-block; background: #d4af37; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View in Dashboard
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; background: #f5f5f5; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from Nas Autos</p>
        </div>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nas Autos <notifications@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `New ${getLeadTypeLabel(leadType)} from ${name}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const result = await emailResponse.json();

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
