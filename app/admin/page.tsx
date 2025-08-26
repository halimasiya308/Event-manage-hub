import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthHeader } from "@/components/auth-header"
import { AdminStats } from "@/components/admin-stats"
import { EventManagement } from "@/components/event-management"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  const { data: eventsSimple } = await supabase.from("events").select("*").order("created_at", { ascending: false })

  // Get registration counts for each event with better error handling
  const eventsWithCounts = await Promise.all(
    (eventsSimple || []).map(async (event) => {
      try {
        const { count, error } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("status", "registered")

        if (error) {
          console.error(`[v0] Error fetching count for event ${event.id}:`, error)
        }

        console.log(`[v0] Event "${event.title}" has ${count || 0} registrations`)

        return {
          ...event,
          current_participants: count || 0,
        }
      } catch (error) {
        console.error(`[v0] Failed to fetch registrations for event ${event.id}:`, error)
        return {
          ...event,
          current_participants: 0,
        }
      }
    }),
  )

  console.log(
    "[v0] Events with counts:",
    eventsWithCounts.map((e) => ({ title: e.title, count: e.current_participants })),
  )

  const { data: totalRegistrations } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact" })
    .eq("status", "registered")

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .gte("event_date", new Date().toISOString())

  return (
    <div className="min-h-screen bg-background">
      <AuthHeader user={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage college events and track registrations</p>
          </div>
          <CreateEventDialog />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AdminStats
              totalEvents={eventsWithCounts?.length || 0}
              upcomingEvents={upcomingEvents?.length || 0}
              totalRegistrations={totalRegistrations?.length || 0}
              events={eventsWithCounts || []}
            />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventManagement events={eventsWithCounts || []} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Registration Analytics</h2>
              <div className="text-center py-12 text-muted-foreground">
                <p>Detailed analytics coming soon...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
