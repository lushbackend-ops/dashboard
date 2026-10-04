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

    // AI Enrichment & Extraction: Parse the email body and score the lead automatically!
    let aiScore = 0;
    let aiStatus = "New";
    let finalCompanyName = company_name;
    let finalEmail = contact_email;

    if (process.env.AI_PROVIDER_API_KEY) {
      try {
        const ai = getAIProvider();
        const analysis = await ai.generateStructuredOutput<{
          score: number, 
          priority: string,
          extracted_name: string,
          extracted_email: string
        }>(
          `Analyze this incoming B2B lead for Lush Trade Corp. 
           Make.com sent this Name: ${company_name} and Email: ${contact_email}. 
           HOWEVER, read the raw email body below and extract the REAL Name and REAL Email if they exist.
           
           Raw Email Body: ${extra_info}
           
           Return JSON with:
           - "score" (0-100)
           - "priority" ("High", "Medium", "Low")
           - "extracted_name" (The real name of the lead, e.g., 'Siddharth Vishwakarma')
           - "extracted_email" (The real email, e.g., 'siddharthv210106@gmail.com')`,
          null
        );
        
        aiScore = analysis.score || 0;
        aiStatus = analysis.priority === "High" ? "Hot Lead" : "New";
        
        // If the AI found a real name/email in the body, override Make.com's metadata
        if (analysis.extracted_name && analysis.extracted_name.length > 2) {
          finalCompanyName = analysis.extracted_name;
        }
        if (analysis.extracted_email && analysis.extracted_email.includes("@")) {
          finalEmail = analysis.extracted_email;
        }
        
      } catch (e) {
        console.error("AI scoring/parsing failed during webhook:", e);
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          company_name: finalCompanyName,
          contact_email: finalEmail,
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
