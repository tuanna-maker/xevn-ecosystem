import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANDING_SYSTEM_PROMPT = `You are UniHRM's AI assistant - a smart HR management platform. Your role is to consult potential customers who are learning about the product.

You have knowledge about UniHRM including:
1. **Employee Management**: Profiles, contracts, work history, degrees, certificates
2. **Attendance**: QR Code, Face ID, GPS, WiFi - flexible multi-format
3. **Payroll**: Custom formulas, PIT, social/health/unemployment insurance auto-calculated
4. **Recruitment**: Job postings, CV screening, interviews, candidate evaluation
5. **Reports**: Visual dashboard, HR data analytics
6. **Security**: Detailed permissions, data encryption

Service plans:
- Starter: 30 employees, 14-day free trial
- Standard: 60 employees
- Professional: 100 employees
- Enterprise: 150 employees
- Enterprise Plus: 200 employees

IMPORTANT: Always detect the language the user is writing in and respond in that SAME language. Support Vietnamese, English, Chinese, Lao, Khmer, and Myanmar languages.

Be friendly, professional, and concise. Encourage customers to sign up for a trial.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: LANDING_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Đã vượt quá giới hạn yêu cầu, vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Hệ thống đang bảo trì, vui lòng thử lại sau." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Lỗi kết nối AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Landing AI Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Lỗi không xác định" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
