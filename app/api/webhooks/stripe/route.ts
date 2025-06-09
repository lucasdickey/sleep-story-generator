import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
// TODO: Re-enable these imports when implementing the frontend in Phase 2
// import { handleStripeWebhook, extractPhoneNumber } from "@/lib/stripe";
// import { startStoryGeneration } from "@/lib/generation-pipeline";
// import { updateJobProgress } from "@/lib/supabase";
// import { formatPhoneNumber } from "@/lib/twilio";
// import Stripe from "stripe"; // TODO: Re-enable when implementing webhook handlers

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

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

const supabase =
  supabaseUrl && supabaseKey && isValidUrl(supabaseUrl)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.error(
          "Supabase not configured - webhook cannot process payment"
        );
        return NextResponse.json(
          { error: "Configuration error" },
          { status: 500 }
        );
      }

      // Extract data from session
      const transactionToken = session.metadata?.transactionToken;
      const customization = JSON.parse(session.metadata?.customization || "{}");
      const customerPhone = session.customer_details?.phone;
      const customerEmail = session.customer_details?.email;

      // Get SMS consent from custom fields
      let smsConsent = false;
      if (session.custom_fields) {
        const consentField = session.custom_fields.find(
          (f) => f.key === "sms_consent"
        );
        smsConsent = consentField?.dropdown?.value === "yes";
      }

      if (!transactionToken) {
        throw new Error("No transaction token found in session metadata");
      }

      // Create job record in database
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          transaction_token: transactionToken,
          customization: customization,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          sms_consent: smsConsent,
          status: "pending",
          payment_status: "completed",
          stripe_session_id: session.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (jobError) {
        console.error("Error creating job record:", jobError);
        throw jobError;
      }

      // Initialize progress tracking
      const progressSteps = [
        {
          step: "story_generation",
          status: "pending",
          started_at: null,
          completed_at: null,
        },
        {
          step: "metadata_generation",
          status: "pending",
          started_at: null,
          completed_at: null,
        },
        {
          step: "artwork_generation",
          status: "pending",
          started_at: null,
          completed_at: null,
        },
        {
          step: "audio_generation",
          status: "pending",
          started_at: null,
          completed_at: null,
        },
      ];

      for (const progress of progressSteps) {
        await supabase.from("job_progress").insert({
          job_id: job.id,
          step: progress.step,
          status: progress.status,
          started_at: progress.started_at,
          completed_at: progress.completed_at,
        });
      }

      // Trigger the generation process via our API endpoint
      try {
        const generationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-story`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobId: job.id,
              transactionToken: transactionToken,
            }),
          }
        );

        if (!generationResponse.ok) {
          const errorData = await generationResponse.text();
          console.error("Failed to trigger generation:", errorData);
          // Don't throw error - payment was successful, generation can be retried
        } else {
          const responseData = await generationResponse.json();
          console.log(
            `Successfully triggered generation for job ${job.id}:`,
            responseData
          );
        }
      } catch (error) {
        console.error("Error triggering generation:", error);
        // Don't throw error - payment was successful, generation can be retried
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Error processing completed payment:", error);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

// TODO: Implement these functions in Phase 2 when all dependencies are available
// async function handleCheckoutCompleted(session: Stripe.Checkout.Session) { ... }
// async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) { ... }
// async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) { ... }
