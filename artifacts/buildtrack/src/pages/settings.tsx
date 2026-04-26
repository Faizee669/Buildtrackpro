import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useUserProfile, useUpdateProfile, type UpdateProfilePayload } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Settings as SettingsIcon,
  User,
  Bell,
  CreditCard,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
  Shield,
  Lock,
} from "lucide-react"

interface FormValues {
  firstName: string
  lastName: string
  companyName: string
  notificationsEmail: boolean
  notificationsOverbudget: boolean
}

const PLANS = [
  {
    key: "free",
    name: "Starter",
    price: "Free",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    features: ["Up to 3 projects", "100 expenses/month", "Basic analytics", "CSV export"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₹999/mo",
    color: "bg-primary/10 text-primary border-primary/30",
    features: ["Unlimited projects", "Unlimited expenses", "AI insights", "Client share links", "Priority support"],
  },
]

export default function Settings() {
  const { data: profile, isLoading } = useUserProfile()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()
  const { toast } = useToast()

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      notificationsEmail: true,
      notificationsOverbudget: true,
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        companyName: profile.companyName ?? "",
        notificationsEmail: profile.notificationsEmail,
        notificationsOverbudget: profile.notificationsOverbudget,
      })
    }
  }, [profile, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProfile({
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        companyName: values.companyName || undefined,
        notificationsEmail: values.notificationsEmail,
        notificationsOverbudget: values.notificationsOverbudget,
      } satisfies UpdateProfilePayload)
      toast({ title: "Settings saved", description: "Your profile has been updated." })
    } catch {
      toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentPlan = PLANS.find((p) => p.key === (profile?.plan ?? "free")) ?? PLANS[0]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your profile and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile section */}
        <Card className="border-card-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-base">Profile</h2>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl overflow-hidden flex-shrink-0">
                {profile?.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (profile?.firstName?.[0] ?? profile?.email?.[0]?.toUpperCase() ?? "U")
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <Badge className={`mt-1 text-xs ${currentPlan.color}`}>{currentPlan.name} Plan</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <input
                  {...register("firstName")}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  {...register("lastName")}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Sharma"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Company Name
              </label>
              <input
                {...register("companyName")}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="Sharma Builders Pvt. Ltd."
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications section */}
        <Card className="border-card-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-base">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive weekly expense summaries via email</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("notificationsEmail")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>

              <div className="h-px bg-card-border" />

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium">Budget alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when a project exceeds its budget</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("notificationsOverbudget")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full gradient-primary text-primary-foreground font-semibold gap-2 h-11"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Plan section */}
      <Card className="border-card-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-base">Subscription Plan</h2>
          </div>

          <div className="grid gap-3">
            {PLANS.map((plan) => {
              const isActive = plan.key === (profile?.plan ?? "free")
              return (
                <div
                  key={plan.key}
                  className={`relative border rounded-xl p-4 transition-all ${
                    isActive
                      ? "border-primary bg-primary/3 shadow-sm"
                      : "border-card-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{plan.name}</span>
                        {isActive && (
                          <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Current</Badge>
                        )}
                      </div>
                      <span className="text-xl font-black text-primary">{plan.price}</span>
                    </div>
                    {plan.key === "pro" && <Sparkles className="w-5 h-5 text-primary opacity-60" />}
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!isActive && plan.key === "pro" && (
                    <Button className="mt-4 w-full gradient-primary text-primary-foreground gap-2 text-sm" size="sm">
                      <Sparkles className="w-4 h-4" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2.5">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Secure payments powered by Stripe. Cancel anytime.</span>
          </div>
        </CardContent>
      </Card>

      {/* Security section */}
      <Card className="border-card-border shadow-sm">
        <CardContent className="p-6">
          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Account</h3>
            <p className="text-sm text-muted-foreground">
              Your account is secured via email and password authentication. Profile details are securely managed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
