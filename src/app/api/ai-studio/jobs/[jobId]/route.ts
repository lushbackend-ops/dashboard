import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ jobId: string }> }) {
  // In a real application, fetch job status from DB
  const params = await props.params;
  const { jobId } = params;

  // Mocking completion
  return NextResponse.json({
    jobId,
    status: "completed",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  });
}
