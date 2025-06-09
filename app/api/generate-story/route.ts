import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateCompleteStory, StoryCustomization } from "@/lib/generation";

// Initialize Supabase client with safer validation
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Return null if environment variables are missing
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
    return createClient(supabaseUrl, supabaseKey);
  } catch {
    console.error("Invalid Supabase URL format:", supabaseUrl);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { jobId, transactionToken } = await request.json();

    // Validate required parameters
    if (!jobId && !transactionToken) {
      return NextResponse.json(
        { error: "Either jobId or transactionToken is required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabase) {
      console.error("Supabase not configured - cannot process generation");
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Load job data from database
    let jobQuery = supabase.from("jobs").select("*");

    if (jobId) {
      jobQuery = jobQuery.eq("id", jobId);
    } else {
      jobQuery = jobQuery.eq("transaction_token", transactionToken);
    }

    const { data: job, error: jobError } = await jobQuery.single();

    if (jobError || !job) {
      console.error("Error loading job:", jobError);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if job is in valid state for generation
    if (job.status !== "pending") {
      return NextResponse.json(
        { error: `Job is in ${job.status} state, cannot regenerate` },
        { status: 400 }
      );
    }

    // Update job status to processing
    await supabase
      .from("jobs")
      .update({
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    console.log(
      `Starting story generation for job ${job.id} (token: ${job.transaction_token})`
    );

    // Prepare customization data
    const customization: StoryCustomization = job.customization || {};

    // Start the generation process (runs in background)
    // We don't await this to avoid timeout issues - the progress is tracked via database
    setImmediate(async () => {
      try {
        await generateCompleteStory(customization, job.id);

        // Update job status to completed
        await supabase
          .from("jobs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        console.log(`Story generation completed for job ${job.id}`);

        // TODO: Send SMS notification if customer consented
        if (job.sms_consent && job.customer_phone) {
          console.log(
            `Would send SMS to ${job.customer_phone} for job ${job.id}`
          );
        }
      } catch (error) {
        console.error(`Generation failed for job ${job.id}:`, error);

        // Update job status to failed
        await supabase
          .from("jobs")
          .update({
            status: "failed",
            error_message:
              error instanceof Error ? error.message : "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);
      }
    });

    // Return immediately with generation started confirmation
    return NextResponse.json({
      success: true,
      jobId: job.id,
      transactionToken: job.transaction_token,
      status: "processing",
      message: "Story generation started successfully",
      progressUrl: `/progress/${job.transaction_token}`,
    });
  } catch (error: unknown) {
    console.error("Error in generate-story API:", error);
    return NextResponse.json(
      {
        error: "Failed to start story generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
