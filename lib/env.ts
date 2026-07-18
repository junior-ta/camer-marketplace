// ── Environment Variable Validator ─────────────────────────────
// This file runs at startup and throws a clear error if any required environment variable is missing.

const requiredServerVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const

const requiredPublicVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const

// Validate server-side vars when running on the server
if (typeof window === "undefined") {
  const missing = requiredServerVars.filter(
    (key) => !process.env[key]
  )

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCheck your .env.local file.`
    )
  }
}

// Validate Public variables on both server and client
const missingPublic = requiredPublicVars.filter(
  (key) => !process.env[key]
)

if (missingPublic.length > 0) {
  throw new Error(
    `❌ Missing required public environment variables:\n${missingPublic.map((k) => `  - ${k}`).join("\n")}\n\nCheck your .env.local file.`
  )
}

export const env = {
  // Server only
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  nextAuthSecret: process.env.NEXTAUTH_SECRET!,
  nextAuthUrl: process.env.NEXTAUTH_URL!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // Public (safe to expose to browser)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
} as const