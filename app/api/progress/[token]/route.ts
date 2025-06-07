import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseKey || !isValidUrl(supabaseUrl)) {
  console.error("Missing or invalid Supabase environment variables:", {
    url: supabaseUrl
      ? isValidUrl(supabaseUrl)
        ? "valid"
        : "invalid"
      : "missing",
    key: supabaseKey ? "set" : "missing",
  });
}

const supabase =
  supabaseUrl && supabaseKey && isValidUrl(supabaseUrl)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Get job by transaction token
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("transaction_token", token)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get progress steps for this job
    const { data: progress, error: progressError } = await supabase
      .from("job_progress")
      .select("*")
      .eq("job_id", job.id)
      .order("step");

    if (progressError) {
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      paymentStatus: job.payment_status,
      customization: job.customization,
      progress: progress || [],
      error: job.error_message,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
