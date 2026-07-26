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

  // Only rate limit the actual login attempt (credentials callback)
  // NOT internal NextAuth endpoints like /session, /csrf, /providers
  // Those are called automatically by NextAuth on every page load
  if (pathname === "/api/auth/callback/credentials") {
    if (!rateLimit(ip, "auth-login", 5, 60_000)) {
      // Redirect back to login with error param instead of returning JSON
      // This prevents the browser landing on /api/auth/error
      const loginUrl = new URL("/login", req.nextUrl.origin)
      loginUrl.searchParams.set("error", "rate_limited")
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rate limit user registration separately
  if (pathname === "/api/auth/register") {
    if (!rateLimit(ip, "auth-register", 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      )
    }
  }

  // Checkout: 10 req/min
  if (pathname.startsWith("/api/checkout")) {
    if (!rateLimit(ip, "checkout", 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      )
    }
  }

  // Global API: 100 req/min — excludes auth internals to avoid false positives
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
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