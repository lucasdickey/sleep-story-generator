import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { customization } = await request.json();

    // Generate a unique transaction token for tracking
    const transactionToken = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Custom Sleep Story",
              description: `A personalized sleep story featuring ${
                customization.characterName || "your character"
              }`,
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/progress/${transactionToken}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?cancelled=true`,
      metadata: {
        transactionToken,
        customization: JSON.stringify(customization),
      },
      // Enable phone number collection for SMS notifications
      phone_number_collection: {
        enabled: true,
      },
      // Add custom fields for better SMS consent
      custom_fields: [
        {
          key: "sms_consent",
          label: {
            type: "custom",
            custom: "SMS Notification Consent",
          },
          type: "dropdown",
          dropdown: {
            options: [
              {
                label: "Yes, send me SMS updates about my story generation",
                value: "yes",
              },
              {
                label: "No, I do not want SMS notifications",
                value: "no",
              },
            ],
          },
          optional: false,
        },
      ],
    });

    return NextResponse.json({
      sessionId: session.id,
      transactionToken,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Error creating payment session:", error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
