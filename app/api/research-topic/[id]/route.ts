import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Create Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get research topic
    const { data, error } = await supabase
      .from("research_topics")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Research topic not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching research topic:", error)
    return NextResponse.json({ error: "Failed to fetch research topic", message: error.message }, { status: 500 })
  }
}
