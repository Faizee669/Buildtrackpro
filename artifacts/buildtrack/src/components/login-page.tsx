import { useState } from "react"
import { HardHat, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Mode = "options" | "email-login" | "email-register"

interface Props {
  onReplitLogin: () => void;
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

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
      } else {
        window.location.reload()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/auth-bg.png)` }} />
      <div className="z-10 flex flex-col items-center gap-5 bg-card p-8 rounded-xl shadow-2xl border border-border max-w-sm w-full mx-4">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
          <HardHat className="w-10 h-10" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">BUILDTRACK</h2>
          <p className="text-muted-foreground text-sm">Construction Expense Manager</p>
        </div>

        {mode === "options" && (
          <>
            <p className="text-center text-sm text-muted-foreground -mt-1">
              Track project expenses, receipts, and budgets across all your job sites.
            </p>

            <button
              onClick={onReplitLogin}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-md shadow-lg transition-all active:scale-[0.98]"
            >
              Log in with Replit
            </button>

            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={() => setMode("email-login")}
                className="w-full flex items-center justify-center gap-2 border border-border bg-secondary/50 hover:bg-secondary text-foreground font-semibold py-2.5 px-6 rounded-md transition-all text-sm"
              >
                <Mail className="w-4 h-4" />
                Sign in with Email
              </button>
              <button
                onClick={() => setMode("email-register")}
                className="w-full flex items-center justify-center gap-2 border border-border bg-transparent hover:bg-secondary/50 text-muted-foreground font-medium py-2.5 px-6 rounded-md transition-all text-sm"
              >
                Create a new account
              </button>
            </div>
          </>
        )}

        {(mode === "email-login" || mode === "email-register") && (
          <form onSubmit={handleEmailAuth} className="w-full space-y-3">
            <p className="text-sm font-semibold text-center text-foreground">
              {mode === "email-login" ? "Sign in to your account" : "Create a new account"}
            </p>

            {mode === "email-register" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="First name"
                    className="pl-9"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder="Email address"
                required
                className="pl-9"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "email-register" ? "Password (min. 8 characters)" : "Password"}
                required
                minLength={8}
                className="pl-9 pr-10"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md py-2 px-3">{error}</p>
            )}

            <Button type="submit" className="w-full font-bold" disabled={loading}>
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : mode === "email-login" ? "Sign In" : "Create Account"
              }
            </Button>

            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={() => { setMode("options"); setError("") }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              {mode === "email-login" ? (
                <button
                  type="button"
                  onClick={() => { setMode("email-register"); setError(""); setForm(f => ({ ...f, password: "" })) }}
                  className="text-primary hover:underline"
                >
                  Create account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode("email-login"); setError(""); setForm(f => ({ ...f, password: "" })) }}
                  className="text-primary hover:underline"
                >
                  Sign in instead
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
