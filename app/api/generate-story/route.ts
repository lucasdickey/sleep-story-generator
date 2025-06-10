import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateCompleteStory, StoryCustomization } from "@/lib/generation";

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

    // Initialize Supabase client at runtime only
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables not configured");
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client at request time with error handling
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
      console.error("Failed to create Supabase client:", error);
      return NextResponse.json(
        { error: "Database connection error" },
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

        // Send SMS notification if customer consented
        if (job.sms_consent && job.customer_phone) {
          try {
            const { sendCompletionNotification } = await import("@/lib/sns");
            await sendCompletionNotification(
              job.customer_phone,
              job.transaction_token
            );
            console.log(
              `SMS notification sent to ${job.customer_phone} for job ${job.id}`
            );
          } catch (smsError) {
            console.error("Failed to send SMS notification:", smsError);
          }
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

        // Send SMS error notification if customer consented
        if (job.sms_consent && job.customer_phone) {
          try {
            const { sendErrorNotification } = await import("@/lib/sns");
            await sendErrorNotification(
              job.customer_phone,
              job.transaction_token
            );
            console.log(
              `Error SMS notification sent to ${job.customer_phone} for job ${job.id}`
            );
          } catch (smsError) {
            console.error("Failed to send error SMS notification:", smsError);
          }
        }
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
