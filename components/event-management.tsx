"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Edit, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { EventRegistrationsDialog } from "@/components/event-registrations-dialog"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  registration_deadline: string
  location: string
  max_participants: number
  current_participants: number
  created_at: string
}

interface EventManagementProps {
  events: Event[]
}

export function EventManagement({ events }: EventManagementProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDeleteEvent = async (eventId: string) => {
    setIsDeleting(eventId)
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Failed to delete event:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleViewRegistrations = (eventId: string, eventTitle: string) => {
    console.log(`[v0] Opening registrations dialog for event: ${eventTitle} (${eventId})`)
    setSelectedEventId(eventId)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No events created yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first event to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Event Management</h2>
      <div className="grid gap-4">
        {events.map((event) => {
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
          const isUpcoming = new Date(event.event_date) > new Date()
          const registrationOpen = new Date(event.registration_deadline) > new Date()

          console.log(`[v0] Rendering event "${event.title}" with ${event.current_participants} participants`)

          return (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="mt-1">{event.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUpcoming ? <Badge variant="secondary">Upcoming</Badge> : <Badge variant="outline">Past</Badge>}
                    {registrationOpen && <Badge variant="default">Registration Open</Badge>}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {eventDate} at {eventTime}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-bold text-primary text-lg">{event.current_participants || 0}</span>
                      <span className="text-muted-foreground ml-1">/{event.max_participants || "∞"} registered</span>
                      {event.max_participants && (
                        <Badge
                          variant={event.current_participants >= event.max_participants ? "destructive" : "secondary"}
                          className="ml-2 text-xs"
                        >
                          {event.current_participants >= event.max_participants
                            ? "Full"
                            : `${event.max_participants - (event.current_participants || 0)} spots left`}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRegistrations(event.id, event.title)}
                      className="bg-transparent"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Registrations ({event.current_participants || 0})
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={isDeleting === event.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting === event.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedEventId && (
        <EventRegistrationsDialog eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
      )}
    </div>
  )
}
