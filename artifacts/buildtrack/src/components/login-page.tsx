import { useState } from "react"
import { HardHat, Mail, Lock, User, Eye, EyeOff, Loader2, Building2, ShieldCheck, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Mode = "options" | "email-login" | "email-register"

interface Props {
  onReplitLogin: () => void
}

export function LoginPage({ onReplitLogin }: Props) {
  const [mode, setMode] = useState<Mode>("options")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" })

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "")

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const endpoint = mode === "email-login" ? "/api/auth/login/email" : "/api/auth/register"
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Something went wrong. Please try again.")
      else window.location.reload()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left hero column — hidden on mobile */}
      <aside className="hidden lg:flex relative flex-1 flex-col justify-between p-12 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/auth-bg.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-primary/40" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-md">
            <HardHat className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            BuildTrack <span className="text-orange-300">Pro+</span>
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            Build with confidence. <span className="text-orange-300">Track every rupee.</span>
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Real-time expense tracking, crew management, and profit insights for construction teams.
          </p>
          <div className="space-y-3 pt-2">
            {[
              { icon: BarChart3, text: "Live profit & margin tracking across every project" },
              { icon: Building2, text: "Crew, materials, and phases in one workspace" },
              { icon: ShieldCheck, text: "Secure cloud sync with offline-ready PWA" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-white/15 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                  <f.icon className="w-4 h-4 text-orange-300" />
                </div>
                <span className="text-sm text-white/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          © 2026 BuildTrack Pro+ · Construction Expense Manager
        </div>
      </aside>

      {/* Right form column */}
      <main className="flex flex-col flex-1 lg:flex-none lg:w-[480px] items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-md">
              <HardHat className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              BuildTrack <span className="text-primary">Pro+</span>
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight">
              {mode === "email-register" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "email-register"
                ? "Start tracking your projects in minutes."
                : "Sign in to manage your projects, expenses, and crew."}
            </p>
          </div>

          {mode === "options" && (
            <div className="space-y-4">
              <button
                onClick={onReplitLogin}
                className="w-full flex items-center justify-center gap-2 gradient-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-md shadow-primary/20 hover:opacity-95 transition-opacity active:scale-[0.98]"
              >
                Continue with Replit
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-card-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-card-border" />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setMode("email-login")}
                  className="w-full flex items-center justify-center gap-2 border border-card-border bg-card hover:bg-muted text-foreground font-semibold py-2.5 px-6 rounded-lg transition-all text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Sign in with Email
                </button>
                <button
                  onClick={() => setMode("email-register")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  New here? <span className="text-primary font-semibold">Create an account</span>
                </button>
              </div>
            </div>
          )}

          {(mode === "email-login" || mode === "email-register") && (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === "email-register" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="First name"
                      className="pl-9 rounded-lg"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Last name"
                    className="rounded-lg"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Email address"
                  required
                  className="pl-9 rounded-lg"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "email-register" ? "Password (min. 8 characters)" : "Password"}
                  required
                  minLength={8}
                  className="pl-9 pr-10 rounded-lg"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center bg-destructive/10 rounded-lg py-2 px-3">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full font-semibold gradient-primary text-primary-foreground rounded-lg py-3"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === "email-login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("options")
                    setError("")
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                {mode === "email-login" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("email-register")
                      setError("")
                      setForm((f) => ({ ...f, password: "" }))
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Create account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("email-login")
                      setError("")
                      setForm((f) => ({ ...f, password: "" }))
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in instead
                  </button>
                )}
              </div>
            </form>
          )}

          <p className="text-[11px] text-muted-foreground text-center pt-4">
            By continuing you agree to BuildTrack Pro+'s Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  )
}
