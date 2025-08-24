import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

interface RegisteredEvent {
  id: string
  registered_at: string
  status: string
  events: {
    id: string
    title: string
    description: string
    event_date: string
    location: string
  }
}

interface RegisteredEventsProps {
  registrations: RegisteredEvent[]
}

export function RegisteredEvents({ registrations }: RegisteredEventsProps) {
  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">You haven't registered for any events yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Browse upcoming events to find something interesting!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Registered Events</h2>
        <Button asChild variant="outline" size="sm" className="bg-transparent">
          <Link href="/student/registrations">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Registrations
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {registrations.map((registration) => {
          const event = registration.events
          const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          const eventTime = new Date(event.event_date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
          const registeredDate = new Date(registration.registered_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })

          return (
            <Card key={registration.id}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <Badge variant="default">Registered</Badge>
                </div>
                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{eventDate}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{eventTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Registered on {registeredDate}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
