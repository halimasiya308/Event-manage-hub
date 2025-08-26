import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Users, Trophy, Star, ArrowRight, CheckCircle } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect based on their role
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/student")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float" />
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-accent/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-primary/10 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in-up">
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                🎓 Welcome to Your College Event Hub
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-black text-primary mb-6 leading-tight">
                Discover Amazing
                <span className="text-accent block">Campus Events</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students in creating unforgettable memories. Register for events, connect with peers,
                and make the most of your college experience.
              </p>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  asChild
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/auth/login">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300"
                >
                  <Link href="/auth/sign-up">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay connected with your campus community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Easy Event Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Browse and discover exciting campus events tailored to your interests and schedule.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Instant Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Register for events with just one click and receive instant confirmations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Track Your Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Keep track of your registered events and build your campus involvement portfolio.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Choose Your Role</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Different access levels for different needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-white to-cyan-50/30">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">Students</CardTitle>
                    <CardDescription>Discover and join events</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Browse upcoming campus events</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Register for events instantly</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Track your registrations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Receive event updates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/20 bg-gradient-to-br from-white to-orange-50/30">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-accent">Administrators</CardTitle>
                    <CardDescription>Create and manage events</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>Create and schedule events</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>Manage registrations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>Track attendance and analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>Export registration data</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary/5 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Join your campus community today and never miss an event again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
                <Link href="/auth/login">Login to Your Account</Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 hover:bg-white">
                <Link href="/auth/sign-up">Create New Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
