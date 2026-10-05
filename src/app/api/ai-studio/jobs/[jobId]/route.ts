import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { jobId: string } }) {
  // In a real application, fetch job status from DB
  const { jobId } = params;

  // Mocking completion
  return NextResponse.json({
    jobId,
    status: "completed",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  });
}
