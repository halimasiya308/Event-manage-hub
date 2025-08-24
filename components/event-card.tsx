"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  registration_deadline: string
  location: string
  max_participants: number
  current_participants: number
}

interface EventCardProps {
  event: Event
  userId: string
}

export function EventCard({ event, userId }: EventCardProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isUnregistering, setIsUnregistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState<"register" | "unregister">("register")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Check if user is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      const { data } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_id", userId)
        .eq("status", "registered")
        .single()

      setIsRegistered(!!data)
    }

    checkRegistration()
  }, [event.id, userId, supabase])

  // Check if registration deadline has passed
  const isRegistrationOpen = new Date(event.registration_deadline) > new Date()
  const isEventFull = event.current_participants >= event.max_participants
  const isEventPast = new Date(event.event_date) < new Date()

  // Format dates
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
  const registrationDeadline = new Date(event.registration_deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleRegister = async () => {
    setIsRegistering(true)
    try {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        user_id: userId,
      })

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - already registered
          toast({
            title: "Already Registered",
            description: "You are already registered for this event.",
            variant: "destructive",
          })
        } else {
          throw error
        }
      } else {
        setIsRegistered(true)
        toast({
          title: "Registration Successful!",
          description: `You have successfully registered for ${event.title}.`,
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Registration failed:", error)
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
      setShowConfirmDialog(false)
    }
  }

  const handleUnregister = async () => {
    setIsUnregistering(true)
    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({ status: "cancelled" })
        .eq("event_id", event.id)
        .eq("user_id", userId)

      if (error) throw error

      setIsRegistered(false)
      toast({
        title: "Registration Cancelled",
        description: `You have cancelled your registration for ${event.title}.`,
      })
      router.refresh()
    } catch (error) {
      console.error("Unregistration failed:", error)
      toast({
        title: "Cancellation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUnregistering(false)
      setShowConfirmDialog(false)
    }
  }

  const handleActionClick = (action: "register" | "unregister") => {
    setActionType(action)
    setShowConfirmDialog(true)
  }

  const getButtonState = () => {
    if (isEventPast) return { text: "Event Ended", disabled: true, variant: "outline" as const }
    if (isRegistered) return { text: "Registered", disabled: false, variant: "default" as const }
    if (!isRegistrationOpen) return { text: "Registration Closed", disabled: true, variant: "outline" as const }
    if (isEventFull) return { text: "Event Full", disabled: true, variant: "outline" as const }
    return { text: "Register", disabled: false, variant: "default" as const }
  }

  const buttonState = getButtonState()

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
            <div className="flex flex-col gap-1">
              {isEventPast && <Badge variant="outline">Past Event</Badge>}
              {!isRegistrationOpen && !isEventPast && <Badge variant="secondary">Registration Closed</Badge>}
              {isEventFull && <Badge variant="destructive">Full</Badge>}
              {isRegistered && <Badge variant="default">Registered</Badge>}
            </div>
          </div>
          <CardDescription className="line-clamp-3">{event.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-3 mb-4">
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
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {event.current_participants}/{event.max_participants} registered
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Registration deadline: {registrationDeadline}</p>
            <div className="flex gap-2">
              {isRegistered ? (
                <Button
                  onClick={() => handleActionClick("unregister")}
                  disabled={isUnregistering || isEventPast}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isUnregistering ? "Cancelling..." : "Cancel Registration"}
                </Button>
              ) : (
                <Button
                  onClick={() => handleActionClick("register")}
                  disabled={buttonState.disabled || isRegistering}
                  variant={buttonState.variant}
                  className="flex-1"
                >
                  {isRegistering ? (
                    "Registering..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {buttonState.text}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "register" ? "Confirm Registration" : "Cancel Registration"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "register"
                ? `Are you sure you want to register for "${event.title}"? You will receive a confirmation once registered.`
                : `Are you sure you want to cancel your registration for "${event.title}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={actionType === "register" ? handleRegister : handleUnregister}
              className={actionType === "unregister" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {actionType === "register" ? "Register" : "Cancel Registration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
