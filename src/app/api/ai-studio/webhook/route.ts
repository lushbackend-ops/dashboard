import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.MAKE_WEBHOOK_SECRET || 'dev_secret'}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // In a real application, you would save this job to a database and start processing
    const jobId = `job_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      jobId
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
