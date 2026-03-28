import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that require login
const protectedRoutes = ["/cart", "/checkout", "/orders"]

// Redirect to home if already logged in
const authRoutes = ["/login", "/register"]

// In-memory rate limit store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function rateLimit(
  ip: string,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const storeKey = `${ip}:${key}`
  const entry = rateLimitStore.get(storeKey)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(storeKey, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const ip = getIP(req)

  // ── RATE LIMITING ─────────────────────────────────────────────

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/auth/register")
  ) {
    if (!rateLimit(ip, "auth", 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      )
    }
  }

  if (pathname.startsWith("/api/checkout")) {
    if (!rateLimit(ip, "checkout", 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      )
    }
  }

  if (pathname.startsWith("/api")) {
    if (!rateLimit(ip, "global", 100, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      )
    }
  }

  // ── ROUTE PROTECTION ──────────────────────────────────────────

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}