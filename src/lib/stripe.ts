import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeSecretKey() {
  const key = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations.");
  }
  return key;
}

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      apiVersion: "2025-03-31.basil",
    });
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is required for Stripe webhook verification."
    );
  }
  return secret;
}

export function getAppBaseUrl() {
  const envUrl =
    (process.env.NEXT_PUBLIC_APP_URL ?? "").trim() ||
    (process.env.NEXTAUTH_URL ?? "").trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
