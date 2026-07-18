"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Mail, MessageSquare, User, Send } from "lucide-react"

// Validation schema — mirrors the API schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Client-side validation before hitting the API
    const parsed = contactSchema.safeParse(form)
    if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    const issues = parsed.error.issues ?? parsed.error.errors ?? []
    issues.forEach((err: { path: (string | number)[]; message: string }) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
    })
    setErrors(fieldErrors)
    return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Failed to send message")
        return
      }

      // Show success state
      setSent(true)
      toast.success("Message sent! We'll get back to you soon.")
      setForm({ name: "", email: "", message: "" })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .input-field {
          width: 100%;
          background-color: #f3f3f4;
          border: none;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          color: #1a1c1c;
          outline: none;
          transition: all 0.2s;
          font-family: Inter, sans-serif;
          resize: none;
        }
        .input-field:focus {
          background-color: #ffffff;
          box-shadow: 0 0 0 2px rgba(0,107,53,0.25);
        }
        .input-field::placeholder { color: #9ca3af; }
        .input-error { box-shadow: 0 0 0 2px rgba(186,26,26,0.3) !important; }
      `}</style>

      <div style={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        padding: "60px 40px 80px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h1 style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 900, letterSpacing: "-0.04em",
              color: "#1a3d2b", marginBottom: 16,
            }}>
              Get in Touch
            </h1>
            <p style={{
              fontSize: 17, color: "#4b5563",
              maxWidth: 480, margin: "0 auto", lineHeight: 1.7,
            }}>
              Have a question about a product, an order, or just want
              to say hello? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="contact-grid" 
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 48, alignItems: "start",
          }}>

            {/* ── Left: Info cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Info card */}
              {[
                {
                  icon: Mail,
                  title: "Email Us",
                  desc: "We respond to all emails within 24 hours on business days.",
                  detail: "hello@camer-market.com",
                },
                {
                  icon: User,
                  title: "About Us",
                  desc: "Camer-Market imports authentic African products and delivers them straight to your door.",
                  detail: "Based in Austin, Texas",
                },
              ].map((card) => (
                <div key={card.title} style={{
                  backgroundColor: "#fff",
                  borderRadius: 16, padding: "24px",
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 2px 8px rgba(0,33,12,0.05)",
                  display: "flex", gap: 16,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    backgroundColor: "#e8f5ee", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <card.icon size={20} color="#006b35" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1c1c", marginBottom: 4 }}>
                      {card.title}
                    </p>
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 6 }}>
                      {card.desc}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#006b35" }}>
                      {card.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right: Contact form ── */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 20, padding: "40px",
              border: "1px solid #f0f0f0",
              boxShadow: "0 4px 20px rgba(0,33,12,0.06)",
            }}>
              {sent ? (
                // Success state after submission
                <div style={{
                  textAlign: "center", padding: "40px 20px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 16,
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    backgroundColor: "#e8f5ee",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Send size={32} color="#006b35" />
                  </div>
                  <h2 style={{
                    fontSize: 22, fontWeight: 800,
                    color: "#1a3d2b", letterSpacing: "-0.03em",
                  }}>
                    Message Sent!
                  </h2>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>
                    Thank you for reaching out. We&apos;ll get back
                    to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    style={{
                      marginTop: 8, padding: "12px 28px",
                      borderRadius: 9999,
                      background: "linear-gradient(135deg, #006b35, #008744)",
                      color: "#fff", fontWeight: 700,
                      fontSize: 14, border: "none",
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                // Contact form
                <>
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{
                      fontSize: 22, fontWeight: 800,
                      color: "#1a1c1c", letterSpacing: "-0.03em", marginBottom: 4,
                    }}>
                      Send a Message
                    </h2>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                      Fill in the form below and we&apos;ll be in touch.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: 20 }}
                  >
                    {/* Name */}
                    <div>
                      <label style={{
                        display: "block", fontSize: 10,
                        fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.1em", color: "#3e4a3f", marginBottom: 6,
                      }}>
                        Your Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        placeholder="Alex Rivers"
                        value={form.name}
                        onChange={handleChange}
                        disabled={loading}
                        className={`input-field ${errors.name ? "input-error" : ""}`}
                      />
                      {errors.name && (
                        <p style={{ fontSize: 11, color: "#ba1a1a", marginTop: 4 }}>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{
                        display: "block", fontSize: 10,
                        fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.1em", color: "#3e4a3f", marginBottom: 6,
                      }}>
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="alex@example.com"
                        value={form.email}
                        onChange={handleChange}
                        disabled={loading}
                        className={`input-field ${errors.email ? "input-error" : ""}`}
                      />
                      {errors.email && (
                        <p style={{ fontSize: 11, color: "#ba1a1a", marginTop: 4 }}>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label style={{
                        display: "block", fontSize: 10,
                        fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.1em", color: "#3e4a3f", marginBottom: 6,
                      }}>
                        Message
                      </label>
                      <textarea
                        name="message"
                        placeholder="Tell us how we can help..."
                        value={form.message}
                        onChange={handleChange}
                        disabled={loading}
                        rows={5}
                        className={`input-field ${errors.message ? "input-error" : ""}`}
                      />
                      {errors.message && (
                        <p style={{ fontSize: 11, color: "#ba1a1a", marginTop: 4 }}>
                          {errors.message}
                        </p>
                      )}
                      <p style={{
                        fontSize: 11, color: "#9ca3af",
                        marginTop: 4, textAlign: "right",
                      }}>
                        {form.message.length}/2000
                      </p>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%", padding: "14px",
                        borderRadius: 9999, border: "none",
                        background: loading
                          ? "#e8e8e8"
                          : "linear-gradient(135deg, #006b35, #008744)",
                        color: loading ? "#9ca3af" : "#fff",
                        fontWeight: 700, fontSize: 15,
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 10,
                        boxShadow: loading ? "none" : "0 4px 14px rgba(0,107,53,0.3)",
                        transition: "transform 0.2s, opacity 0.2s",
                        opacity: loading ? 0.7 : 1,
                        fontFamily: "Inter, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.transform = "scale(1.02)"
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <Send size={16} />
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}