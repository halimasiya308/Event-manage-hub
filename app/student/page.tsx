import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthHeader } from "@/components/auth-header"
import { EventCard } from "@/components/event-card"
import { RegisteredEvents } from "@/components/registered-events"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function StudentDashboard() {
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

  // Get upcoming events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })

  // Get user's registered events
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      *,
      events (*)
    `)
    .eq("user_id", user.id)
    .eq("status", "registered")

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader user={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {profile.full_name}!</h1>
          <p className="text-muted-foreground">Discover and register for upcoming college events</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="registered">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
                {events && events.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} userId={user.id} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No upcoming events at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="registered" className="mt-6">
            <RegisteredEvents registrations={registrations || []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
