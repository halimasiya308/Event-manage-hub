"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function login(email: string, password: string) {
  const supabase = createClient()

  console.log("[v0] Server action: Attempting login with email:", email)

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("[v0] Server auth error:", authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "No user returned from authentication" }
    }

    console.log("[v0] Login successful on server, user ID:", authData.user.id)

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("[v0] Profile fetch error:", profileError)
      return { success: false, error: "Failed to fetch user profile" }
    }

    if (!profile) {
      return { success: false, error: "User profile not found" }
    }

    console.log("[v0] User role fetched:", profile.role)

    // Return success and role for client-side redirect
    return { success: true, role: profile.role }
  } catch (error) {
    console.error("[v0] Server login error:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}
