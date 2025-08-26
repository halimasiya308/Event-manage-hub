"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Users } from 'lucide-react'

interface Registration {
  id: string
  registered_at: string
  status: string
  profiles: {
    full_name: string
    email: string
    student_id: string
    department: string
  }
}

interface EventRegistrationsDialogProps {
  eventId: string
  onClose: () => void
}

export function EventRegistrationsDialog({ eventId, onClose }: EventRegistrationsDialogProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [eventTitle, setEventTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        console.log("[v0] Fetching registrations for event:", eventId)

        // Get event details
        const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single()
        console.log("[v0] Event data:", event)

        // Get registrations with user profiles - try the relationship first, then fallback to manual join
        let registrations, error

        // Try the relationship-based query first
        const relationshipQuery = await supabase
          .from("event_registrations")
          .select(`
            *,
            profiles!event_registrations_user_id_fkey (
              full_name,
              email,
              student_id,
              department
            )
          `)
          .eq("event_id", eventId)
          .eq("status", "registered")
          .order("registered_at", { ascending: false })

        if (relationshipQuery.error) {
          console.log("[v0] Relationship query failed, trying manual join:", relationshipQuery.error)
          
          // Fallback to manual join if relationship query fails
          const manualQuery = await supabase
            .from("event_registrations")
            .select(`
              id,
              registered_at,
              status,
              user_id
            `)
            .eq("event_id", eventId)
            .eq("status", "registered")
            .order("registered_at", { ascending: false })

          if (manualQuery.data) {
            // Get profiles separately
            const userIds = manualQuery.data.map(reg => reg.user_id)
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name, email, student_id, department")
              .in("id", userIds)

            // Combine the data
            registrations = manualQuery.data.map(reg => ({
              ...reg,
              profiles: profiles?.find(p => p.id === reg.user_id) || {
                full_name: "Unknown",
                email: "Unknown",
                student_id: "",
                department: ""
              }
            }))
            error = null
          } else {
            registrations = []
            error = manualQuery.error
          }
        } else {
          registrations = relationshipQuery.data
          error = relationshipQuery.error
        }

        console.log("[v0] Registrations data:", registrations)
        console.log("[v0] Registrations error:", error)

        if (error) {
          console.error("[v0] Error fetching registrations:", error)
        }

        setEventTitle(event?.title || "")
        setRegistrations(registrations || [])
      } catch (error) {
        console.error("Failed to fetch registrations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistrations()
  }, [eventId, supabase])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Registrations</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-medium">{eventTitle}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {registrations.length} registered participants
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No registrations yet.</p>
            <p className="text-sm mt-1">Students haven't registered for this event.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Registrations</span>
                </div>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {registrations.length}
                </Badge>
              </div>
            </div>

            {registrations.map((registration) => (
              <Card key={registration.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{registration.profiles.full_name}</CardTitle>
                    <Badge variant="secondary">Registered</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{registration.profiles.email}</span>
                    </div>
                    {registration.profiles.student_id && (
                      <div className="flex items-center text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        <span>ID: {registration.profiles.student_id}</span>
                      </div>
                    )}
                    {registration.profiles.department && (
                      <div className="flex items-center text-muted-foreground">
                        <span className="mr-2">📚</span>
                        <span>{registration.profiles.department}</span>
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Registered on{" "}
                        {new Date(registration.registered_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
