import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthHeader } from "@/components/auth-header"
import { RegistrationStatus } from "@/components/registration-status"

export default async function StudentRegistrationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader user={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Registrations</h1>
          <p className="text-muted-foreground">View and manage your event registrations</p>
        </div>

        <RegistrationStatus userId={user.id} />
      </main>
    </div>
  )
}
