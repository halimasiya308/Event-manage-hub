"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Download } from "lucide-react"

interface RegistrationStatusProps {
  userId: string
}

interface RegistrationWithEvent {
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

export function RegistrationStatus({ userId }: RegistrationStatusProps) {
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data } = await supabase
          .from("event_registrations")
          .select(`
            *,
            events (*)
          `)
          .eq("user_id", userId)
          .order("registered_at", { ascending: false })

        setRegistrations(data || [])
      } catch (error) {
        console.error("Failed to fetch registrations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistrations()
  }, [userId, supabase])

  const generateRegistrationReceipt = (registration: RegistrationWithEvent) => {
    const event = registration.events
    const receiptData = {
      eventTitle: event.title,
      eventDate: new Date(event.event_date).toLocaleDateString(),
      eventTime: new Date(event.event_date).toLocaleTimeString(),
      location: event.location,
      registrationDate: new Date(registration.registered_at).toLocaleDateString(),
      status: registration.status,
    }

    const receiptText = `
EVENT REGISTRATION RECEIPT
========================

Event: ${receiptData.eventTitle}
Date: ${receiptData.eventDate}
Time: ${receiptData.eventTime}
Location: ${receiptData.location}

Registration Date: ${receiptData.registrationDate}
Status: ${receiptData.status.toUpperCase()}

Thank you for registering!
    `.trim()

    const blob = new Blob([receiptText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event.title.replace(/\s+/g, "_")}_registration.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading registration status...</div>
  }

  const activeRegistrations = registrations.filter((r) => r.status === "registered")
  const cancelledRegistrations = registrations.filter((r) => r.status === "cancelled")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Registrations ({activeRegistrations.length})</h3>
        {activeRegistrations.length === 0 ? (
          <p className="text-muted-foreground">No active registrations.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeRegistrations.map((registration) => {
              const event = registration.events
              return (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{new Date(event.event_date).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateRegistrationReceipt(registration)}
                      className="w-full bg-transparent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {cancelledRegistrations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Cancelled Registrations ({cancelledRegistrations.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {cancelledRegistrations.map((registration) => {
              const event = registration.events
              return (
                <Card key={registration.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <Badge variant="outline">Cancelled</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cancelled on {new Date(registration.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
