import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { topic, context } = await req.json()

    // Validate inputs
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available on the server
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    // Create Supabase client
    const supabase = await createClient()

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has enough credits
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    if (profileData.credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 })
    }

    // Generate research using OpenAI
    const prompt = `
      Research the topic "${topic}" for a YouTube video.
      ${context ? `Additional context: ${context}` : ""}
      
      Provide comprehensive research including:
      1. Key points and facts about the topic
      2. Current trends and statistics
      3. Common questions viewers might have
      4. Potential angles for presenting the content
      5. Credible sources for further research
      
      Format the response as a JSON object with the following structure:
      {
        "summary": "Brief overview of the topic",
        "keyPoints": ["Point 1", "Point 2", ...],
        "trends": ["Trend 1", "Trend 2", ...],
        "questions": ["Question 1", "Question 2", ...],
        "contentAngles": ["Angle 1", "Angle 2", ...],
        "sources": ["Source 1", "Source 2", ...]
      }
    `

    // Create OpenAI model - the API key is automatically read from process.env.OPENAI_API_KEY
    const model = openai("gpt-4o")

    const { text: researchJson } = await generateText({
      model,
      prompt,
    })

    // Parse the JSON response
    let research
    try {
      research = JSON.parse(researchJson)
    } catch (error) {
      return NextResponse.json({ error: "Failed to parse research data" }, { status: 500 })
    }

    // Save research to database
    const { data: researchData, error: researchError } = await supabase
      .from("research_topics")
      .insert([
        {
          user_id: session.user.id,
          topic,
          context,
          research_data: research,
          sources: research.sources || [],
        },
      ])
      .select()

    if (researchError) {
      return NextResponse.json({ error: "Failed to save research data" }, { status: 500 })
    }

    // Update user credits
    await supabase
      .from("profiles")
      .update({ credits: profileData.credits - 1 })
      .eq("user_id", session.user.id)

    return NextResponse.json({
      id: researchData[0].id,
      topic,
      research,
    })
  } catch (error: any) {
    console.error("Error researching topic:", error)
    return NextResponse.json({ error: "Failed to research topic", message: error.message }, { status: 500 })
  }
}
