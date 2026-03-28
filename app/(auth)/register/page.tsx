"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsed = registerSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        return
      }
      toast.success("Account created! Please log in.")
      router.push("/login")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, sans-serif; }
        .signature-texture {
          background: linear-gradient(135deg, #006b35 0%, #008744 100%);
        }
        .input-field {
          width: 100%;
          background-color: #e8e8e8;
          border: none;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          color: #1a1c1c;
          outline: none;
          transition: all 0.2s;
          font-family: Inter, sans-serif;
        }
        .input-field:focus {
          background-color: #ffffff;
          box-shadow: 0 0 0 2px rgba(0,107,53,0.3);
        }
        .input-field::placeholder {
          color: #9ca3af;
        }
        .input-error {
          border: 1px solid #ba1a1a !important;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f4f7f4",
        fontFamily: "Inter, sans-serif",
        color: "#1a1c1c",
      }}>
        <main style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Background blobs */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <div style={{
              position: "absolute", top: "-10%", right: "-5%",
              width: 500, height: 500, borderRadius: "50%",
              background: "rgba(0,107,53,0.06)", filter: "blur(120px)",
            }} />
            <div style={{
              position: "absolute", bottom: "-10%", left: "-5%",
              width: 400, height: 400, borderRadius: "50%",
              background: "rgba(0,135,68,0.06)", filter: "blur(100px)",
            }} />
          </div>

          <div style={{ width: "100%", maxWidth: 420, zIndex: 10 }}>

            {/* Brand */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{
                fontSize: 28,
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "-0.05em",
                color: "#1a3d2b",
                marginBottom: 6,
              }}>
                Camer-Market
              </h1>
              <p style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#3e4a3f",
              }}>
                Authentic Flavors of Africa
              </p>
            </div>

            {/* Card */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              padding: "36px 40px",
              boxShadow: "0 20px 40px rgba(0,33,12,0.08)",
            }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#1a1c1c",
                  marginBottom: 4,
                }}>
                  Start your collection
                </h2>
                <p style={{ fontSize: 13, color: "#3e4a3f" }}>
                  Join our community of African culture lovers.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Full Name */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#3e4a3f",
                    marginBottom: 6,
                  }}>
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Alex Rivers"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`input-field ${errors.name ? "input-error" : ""}`}
                  />
                  {errors.name && (
                    <p style={{ fontSize: 11, color: "#ba1a1a", marginTop: 4 }}>{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#3e4a3f",
                    marginBottom: 6,
                  }}>
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`input-field ${errors.email ? "input-error" : ""}`}
                  />
                  {errors.email && (
                    <p style={{ fontSize: 11, color: "#ba1a1a", marginTop: 4 }}>{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#3e4a3f",
                    marginBottom: 6,
                  }}>
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`input-field ${errors.password ? "input-error" : ""}`}
                  />
                  {errors.password && (
                    <p style={{ fontSize: 11, color: "#ba1a1a", marginTop: 4 }}>{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#3e4a3f",
                    marginBottom: 6,
                  }}>
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
                  />
                  {errors.confirmPassword && (
                    <p style={{ fontSize: 11, color: "#ba1a1a", marginTop: 4 }}>{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="signature-texture"
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 9999,
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: "-0.01em",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    marginTop: 4,
                    boxShadow: "0 4px 14px rgba(0,107,53,0.3)",
                    transition: "opacity 0.2s, transform 0.1s",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              {/* Sign in */}
              <div style={{
                marginTop: 28,
                paddingTop: 24,
                borderTop: "1px solid #eeeeee",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 13, color: "#3e4a3f" }}>
                  Already have an account?{" "}
                  <Link href="/login" style={{
                    color: "#006b35",
                    fontWeight: 700,
                    textDecoration: "none",
                    marginLeft: 4,
                  }}>
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Decorative images */}
            <div style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              opacity: 0.4,
              filter: "grayscale(1)",
              transition: "all 0.7s",
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.opacity = "1"
                el.style.filter = "grayscale(0)"
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.opacity = "0.4"
                el.style.filter = "grayscale(1)"
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400"
                alt="Colourful African spices"
                style={{ borderRadius: 8, height: 120, width: "100%", objectFit: "cover" }}
              />
              <img
                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400"
                alt="African marketplace"
                style={{ borderRadius: 8, height: 120, width: "100%", objectFit: "cover", marginTop: 24 }}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: "#eef0ee", paddingTop: 48, paddingBottom: 32 }}>
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 40px",
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            gap: 48,
            alignItems: "center",
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1a3d2b", marginBottom: 6 }}>
                Camer-Market
              </p>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", lineHeight: 1.6 }}>
                © 2025 Camer-Market.<br />Bringing Africa to your door.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "flex-end", alignItems: "center" }}>
              {["Help Center", "Shipping Policy", "Privacy", "Terms of Service"].map((link) => (
                <a key={link} href="#" style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#6b7280",
                  textDecoration: "none",
                }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}