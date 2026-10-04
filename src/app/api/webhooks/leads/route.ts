import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAIProvider } from "@/services/ai";

export async function POST(req: Request) {
  try {
    // Basic security check to ensure random bots don't spam your API
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET || 'lush-trade-secret'}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      // Fallback: try parsing as JSON anyway
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }
    
    // Extract fields from Make.com payload (very forgiving fallback logic)
    const company_name = body.company_name || body.company || body.name || "Unknown Company";
    const contact_email = body.contact_email || body.email || "No Email Provided";
    const source = body.source || body.from || "Gmail (Make.com)";
    const extra_info = body.extra_info || body.text || body.content || body.message || "";

    // Initialize Supabase admin client (using service role key to bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // We are using your provided key here
    );

    // 1. FAST REGEX EXTRACTION (Guaranteed to work for your website form emails)
    let finalCompanyName = company_name;
    let finalEmail = contact_email;
    let finalPhone = "";
    let finalProduct = "";
    let finalMessage = "";

    const nameMatch = extra_info.match(/Name:\s*(.+)/i);
    if (nameMatch) finalCompanyName = nameMatch[1].trim();

    const emailMatch = extra_info.match(/Email:\s*([^\s\n]+)/i);
    // Sometimes it extracts the markdown link like [email](mailto:email), so we clean it:
    if (emailMatch) {
      let rawEmail = emailMatch[1].trim();
      rawEmail = rawEmail.replace(/^\[.*\]\(mailto:/, '').replace(/\)$/, '');
      finalEmail = rawEmail;
    }

    const phoneMatch = extra_info.match(/Phone:\s*(.+)/i);
    if (phoneMatch) finalPhone = phoneMatch[1].trim();

    const productMatch = extra_info.match(/Product:\s*(.+)/i);
    if (productMatch) finalProduct = productMatch[1].trim();

    const msgMatch = extra_info.match(/Message:\s*(.+)/i);
    if (msgMatch) finalMessage = msgMatch[1].trim();

    // 2. AI ENRICHMENT (Only used to score the lead now)
    let aiScore = 0;
    let aiStatus = "New";

    if (process.env.AI_PROVIDER_API_KEY) {
      try {
        const ai = getAIProvider();
        const analysis = await ai.generateStructuredOutput<{
          score: number, 
          priority: string
        }>(
          `Analyze this incoming B2B lead. 
           Name: ${finalCompanyName}
           Product: ${finalProduct}
           Message: ${finalMessage}
           
           Return JSON with:
           - "score" (0-100) based on how likely they are to buy.
           - "priority" ("High", "Medium", "Low")`,
          null
        );
        
        aiScore = analysis.score || 0;
        aiStatus = analysis.priority === "High" ? "Hot Lead" : "New";
        
      } catch (e) {
        console.error("AI scoring failed during webhook:", e);
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          company_name: finalCompanyName,
          contact_email: finalEmail,
          phone: finalPhone,
          product: finalProduct,
          message: finalMessage,
          score: aiScore,
          status: aiStatus,
          // If you ever add a "source" column to your DB, you can uncomment the line below:
          // source: source
        }
      ])
      .select();

    if (error) {
      console.error("DB Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, inserted: data });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
