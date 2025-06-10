import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// Types for SMS notifications
export interface SMSNotification {
  phoneNumber: string;
  message: string;
  subject?: string;
}

// Initialize SNS client
const getSNSClient = () => {
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error("AWS credentials not configured for SNS");
    return null;
  }

  return new SNSClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Format phone number for international SMS
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // If it doesn't start with a country code, assume US (+1)
  if (!cleaned.startsWith("1") && cleaned.length === 10) {
    cleaned = "1" + cleaned;
  }

  // Ensure it starts with +
  if (!phone.startsWith("+")) {
    return "+" + cleaned;
  }

  return phone;
}

// Send SMS notification
export async function sendSMS(notification: SMSNotification): Promise<boolean> {
  const client = getSNSClient();
  if (!client) {
    console.error("SNS client not available - SMS not sent");
    return false;
  }

  try {
    const formattedPhone = formatPhoneNumber(notification.phoneNumber);

    const command = new PublishCommand({
      Message: notification.message,
      PhoneNumber: formattedPhone,
      Subject: notification.subject,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional", // Higher delivery reliability
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "KeyToSleep", // Appears as sender (where supported)
        },
      },
    });

    const response = await client.send(command);
    console.log(
      `SMS sent successfully to ${formattedPhone}`,
      response.MessageId
    );
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
}

// Create story completion message
export function createCompletionMessage(
  transactionToken: string,
  downloadUrl?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://keytosleep.com";
  const progressUrl = `${baseUrl}/progress/${transactionToken}`;

  let message = "🌙 Your Key To Sleep story is ready! ";

  if (downloadUrl) {
    message += `Download your story: ${downloadUrl}`;
  } else {
    message += `View your story: ${progressUrl}`;
  }

  message += "\n\nSweet dreams! 💤";

  return message;
}

// Create error notification message
export function createErrorMessage(
  transactionToken: string,
  supportEmail: string = "apes@a-ok.sh"
): string {
  return (
    `We encountered an issue generating your Key To Sleep story. ` +
    `Please contact support at ${supportEmail} with reference: ${transactionToken}. ` +
    `We'll resolve this quickly!`
  );
}

// Send story completion notification
export async function sendCompletionNotification(
  phoneNumber: string,
  transactionToken: string,
  downloadUrl?: string
): Promise<boolean> {
  const message = createCompletionMessage(transactionToken, downloadUrl);

  return sendSMS({
    phoneNumber,
    message,
    subject: "Your Key To Sleep Story",
  });
}

// Send error notification
export async function sendErrorNotification(
  phoneNumber: string,
  transactionToken: string
): Promise<boolean> {
  const message = createErrorMessage(transactionToken);

  return sendSMS({
    phoneNumber,
    message,
    subject: "Key To Sleep - Action Required",
  });
}
