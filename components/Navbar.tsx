"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Search, Mail, User, Package, LogOut, Menu, X } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .nav-category {
          font-size: 13px;
          font-weight: 500;
          color: #4b5563;
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-category:hover { color: #006b35; }
        .nav-category.active {
          color: #006b35;
          font-weight: 600;
          border-bottom: 2px solid #006b35;
          padding-bottom: 2px;
        }
        .nav-icon-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          color: #1a3d2b;
          font-family: Inter, sans-serif;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-decoration: none;
          transition: opacity 0.2s;
          padding: 0;
        }
        .nav-icon-btn:hover { opacity: 0.7; }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-size: 13px;
          color: #1a1c1c;
          text-decoration: none;
          transition: background 0.15s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: Inter, sans-serif;
        }
        .dropdown-item:hover { background-color: #f4f7f4; color: #006b35; }
        @media (max-width: 1024px) {
          .desktop-categories { display: none !important; }
          .desktop-search { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .mobile-toggle { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 24px rgba(0,33,12,0.06)",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 40px",
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
        }}>

          {/* Logo + Categories */}
          <div style={{ display: "flex", alignItems: "center", gap: 48, flexShrink: 0 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "-0.05em",
                color: "#1a3d2b",
                whiteSpace: "nowrap",
              }}>
                Camer-Market
              </span>
            </Link>

            <div className="desktop-categories" style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <Link href="/" className="nav-category active">All</Link>
              <Link href="/?category=drinks" className="nav-category">Drinks</Link>
              <Link href="/?category=food" className="nav-category">Food</Link>

              {/* Other Categories dropdown */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  className="nav-category"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: 0,
                  }}
                >
                  Other Categories
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {categoriesOpen && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: 0,
                    width: 220,
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e8e8e8",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    zIndex: 50,
                    overflow: "hidden",
                    padding: "8px 0",
                  }}>
                    {[
                      { label: "Electronics",   slug: "electronics"     },
                      { label: "Clothing",      slug: "clothing"        },
                      { label: "Beauty",        slug: "beauty"          },
                      { label: "Home & Living", slug: "home-and-living" },
                      { label: "Sports",        slug: "sports"          },
                      { label: "Toys & Games",  slug: "toys-and-games"  },
                      { label: "Books",         slug: "books"           },
                    ].map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/?category=${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        style={{
                          display: "block",
                          padding: "10px 20px",
                          fontSize: 13,
                          color: "#1a1c1c",
                          textDecoration: "none",
                          transition: "background 0.15s",
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f4f7f4"
                          e.currentTarget.style.color = "#006b35"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                          e.currentTarget.style.color = "#1a1c1c"
                        }}
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div
            className="desktop-search"
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f3f3f4",
              borderRadius: 9999,
              padding: "8px 16px",
              width: 280,
              gap: 8,
              transition: "box-shadow 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,107,53,0.2)")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <Search size={16} color="#6b7280" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#1a1c1c",
                width: "100%",
                fontFamily: "Inter, sans-serif",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  router.push("/")
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 0,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div
            className="desktop-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexShrink: 0,
              color: "#1a3d2b",
            }}
          >
            {/* Contact */}
            <Link href="/contact" className="nav-icon-btn">
              <Mail size={20} />
              <span>Contact Us</span>
            </Link>

            {/* Account */}
            {session ? (
              <div style={{ position: "relative" }}>
                <button
                  className="nav-icon-btn"
                  onClick={() => setAccountOpen((p) => !p)}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #006b35, #008744)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span>{session.user?.name?.split(" ")[0]}</span>
                </button>

                {accountOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 40 }}
                      onClick={() => setAccountOpen(false)}
                    />
                    <div style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 12px)",
                      width: 220,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                      zIndex: 50,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #f0f0f0",
                      }}>
                        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Signed in as
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1c1c" }}>
                          {session.user?.email}
                        </p>
                      </div>
                      <Link href="/orders" className="dropdown-item" onClick={() => setAccountOpen(false)}>
                        <Package size={15} /> My Orders
                      </Link>
                      <Link href="/cart" className="dropdown-item" onClick={() => setAccountOpen(false)}>
                        <ShoppingCart size={15} /> My Cart
                      </Link>
                      <div style={{ borderTop: "1px solid #f0f0f0" }}>
                        <button
                          className="dropdown-item"
                          style={{ color: "#ba1a1a" }}
                          onClick={async () => {
                            setAccountOpen(false)
                            await signOut({ callbackUrl: "/" })
                          }}
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Link href="/login" className="nav-icon-btn">
                  <User size={20} />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  style={{
                    padding: "8px 20px",
                    borderRadius: 9999,
                    background: "linear-gradient(135deg, #006b35, #008744)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    boxShadow: "0 2px 8px rgba(0,107,53,0.3)",
                    transition: "opacity 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              style={{
                position: "relative",
                color: "#1a3d2b",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <ShoppingCart size={22} />
              <span style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#006b35",
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                0
              </span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen((p) => !p)}
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1a3d2b",
              padding: 4,
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="mobile-menu"
            style={{
              borderTop: "1px solid #e8e8e8",
              backgroundColor: "#fff",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Mobile search */}
            <div style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f3f3f4",
              borderRadius: 9999,
              padding: "10px 16px",
              gap: 8,
            }}>
              <Search size={16} color="#6b7280" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setMobileOpen(false)
                    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  width: "100%",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>

            {/* Mobile categories */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "All",           slug: ""               },
                { label: "Drinks",        slug: "drinks"         },
                { label: "Food",          slug: "food"           },
                { label: "Electronics",   slug: "electronics"    },
                { label: "Clothing",      slug: "clothing"       },
                { label: "Beauty",        slug: "beauty"         },
                { label: "Home & Living", slug: "home-and-living"},
                { label: "Sports",        slug: "sports"         },
                { label: "Toys & Games",  slug: "toys-and-games" },
                { label: "Books",         slug: "books"          },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.slug ? `/?category=${cat.slug}` : "/"}
                  className="nav-category"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            <div style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              <Link href="/contact" className="nav-category" onClick={() => setMobileOpen(false)}>
                Contact Us
              </Link>
              {session ? (
                <>
                  <Link href="/orders" className="nav-category" onClick={() => setMobileOpen(false)}>
                    My Orders
                  </Link>
                  <Link href="/cart" className="nav-category" onClick={() => setMobileOpen(false)}>
                    My Cart
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#ba1a1a",
                      textAlign: "left",
                      fontFamily: "Inter, sans-serif",
                      padding: 0,
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="nav-category" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/register" className="nav-category" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height: 80 }} />
    </>
  )
}