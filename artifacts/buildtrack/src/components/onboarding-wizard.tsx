import { useState } from "react"
import { HardHat, Receipt, Users, ArrowRight, X, CheckCircle2, Building2 } from "lucide-react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"

const STEPS = [
  {
    icon: Building2,
    title: "Create your first project",
    description: "Projects are the foundation of BuildTrack. Set a budget, start date, and track every rupee.",
    cta: "Create a Project",
    href: "/projects",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Receipt,
    title: "Log your expenses",
    description: "Add labor, materials, and equipment costs. Attach receipts and assign crew members.",
    cta: "Add an Expense",
    href: "/add-expense",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: Users,
    title: "Build your crew roster",
    description: "Track your workforce, their daily rates, and how much each member costs per project.",
    cta: "Add Crew Members",
    href: "/crew",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
]

interface OnboardingWizardProps {
  onDismiss: () => void
}

export function OnboardingWizard({ onDismiss }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <HardHat className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-muted-foreground tracking-wide uppercase">
              Getting Started
            </span>
          </div>
          <h2 className="text-2xl font-black text-foreground">
            Welcome to BuildTrack <span className="text-primary">Pro+</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            3 simple steps to get your construction finances under control
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-6 pb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="px-6 pb-6">
          <div className={`${current.bg} rounded-xl p-6 mb-6`}>
            <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${current.color}`} />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-2">
              Step {step + 1}: {current.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{current.description}</p>
          </div>

          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            )}

            {step < STEPS.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Skip
                </Button>
                <Link href={current.href} onClick={onDismiss} className="flex-1">
                  <Button className="w-full gradient-primary text-primary-foreground gap-2">
                    {current.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={current.href} onClick={onDismiss} className="flex-1">
                  <Button className="w-full gradient-primary text-primary-foreground gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {current.cta}
                  </Button>
                </Link>
                <Button variant="ghost" className="flex-1" onClick={onDismiss}>
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
