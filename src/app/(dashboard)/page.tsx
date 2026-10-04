import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  
  let leads = [];
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
      
    if (error) {
      console.error("Error fetching leads:", error.message);
    } else {
      leads = data || [];
    }
  } catch (err: any) {
    console.error("Supabase network error (Make sure your Supabase URL is correct):", err.message);
  }

  return <DashboardClient leads={leads} />;
}
