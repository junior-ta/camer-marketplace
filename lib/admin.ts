import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"

// Checks if the current request comes from an admin user.
// Admin emails are defined in ADMIN_EMAILS env variable as a comma-separated list: "a@b.com,c@d.com"

export async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email) return false

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())

  return adminEmails.includes(token.email.toLowerCase())
}