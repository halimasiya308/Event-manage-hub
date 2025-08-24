"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar } from "lucide-react"

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
        // Get event details
        const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single()

        // Get registrations with user profiles
        const { data: registrations } = await supabase
          .from("event_registrations")
          .select(`
            *,
            profiles (
              full_name,
              email,
              student_id,
              department
            )
          `)
          .eq("event_id", eventId)
          .eq("status", "registered")
          .order("registered_at", { ascending: false })

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
            {eventTitle} - {registrations.length} registered participants
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No registrations yet.</div>
        ) : (
          <div className="space-y-4">
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
