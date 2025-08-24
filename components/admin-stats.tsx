import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, TrendingUp, Clock } from "lucide-react"

interface Event {
  id: string
  title: string
  event_date: string
  current_participants: number
  max_participants: number
}

interface AdminStatsProps {
  totalEvents: number
  upcomingEvents: number
  totalRegistrations: number
  events: Event[]
}

export function AdminStats({ totalEvents, upcomingEvents, totalRegistrations, events }: AdminStatsProps) {
  // Calculate average registration rate
  const totalCapacity = events.reduce((sum, event) => sum + event.max_participants, 0)
  const registrationRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0

  // Get most popular event
  const mostPopularEvent = events.reduce(
    (max, event) => (event.current_participants > max.current_participants ? event : max),
    events[0] || { title: "None", current_participants: 0 },
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">All time events created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Events scheduled ahead</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Students registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationRate}%</div>
            <p className="text-xs text-muted-foreground">Average fill rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Event</CardTitle>
            <CardDescription>Event with highest registration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{mostPopularEvent.title}</p>
              <p className="text-sm text-muted-foreground">{mostPopularEvent.current_participants} registrations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events and registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {events.length > 0 ? `Last event: ${events[0].title}` : "No events created yet"}
              </p>
              <p className="text-sm text-muted-foreground">{totalRegistrations} total registrations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
