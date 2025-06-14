import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    // Check if OpenAI API key is available on the server
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const { prompt, context, tone, includeStorytelling, reference_links, language, personalized } = await req.json();

    // Get user data for personalization if needed
    let userStyle = "";
    let userId = "";

    // Create Supabase client
    // const cookieStore = cookies()
    // const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const supabase = await createClient();

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    userId = session.user.id

    // Check if user has enough credits
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("credits, ai_trained")
      .eq("user_id", userId)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    if (profileData.credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 })
    }

    // Get personalization data if requested
    if (personalized) {
      if (profileData.ai_trained) {
        const { data: userData } = await supabase.from("user_style").select("*").eq("user_id", userId).single()

        if (userData) {
          userStyle = `The user's content style has these characteristics:
- Tone: ${userData.tone || "conversational"}
- Vocabulary level: ${userData.vocabulary_level || "intermediate"}
- Pacing: ${userData.pacing || "moderate"}
- Common themes: ${userData.themes || "productivity, self-improvement"}
- Humor style: ${userData.humor_style || "light, occasional jokes"}
- Typical structure: ${userData.structure || "intro, main points, conclusion"}`
        }
      }
    }

    // Build the system prompt
    let systemPrompt = `You are an expert YouTube script writer. Create a high-quality, engaging script for a YouTube video based on the user's prompt.`

    if (personalized && userStyle) {
      systemPrompt += `\n\nPersonalize this script to match the user's style:\n${userStyle}`
    }

    if (tone) {
      systemPrompt += `\n\nThe tone should be ${tone}.`
    }

    if (includeStorytelling) {
      systemPrompt += `\n\nInclude storytelling elements and structure the script into clear scenes (intro, story, main content, outro).`
    }

    if (language && language !== "english") {
      systemPrompt += `\n\nWrite the script in ${language}.`
    }

    // Build the user prompt
    let userPrompt = prompt

    if (context) {
      userPrompt += `\n\nAdditional context: ${context}`
    }

    if (reference_links) {
      userPrompt += `\n\nUse these references: ${reference_links}`
    } else {
      userPrompt += `\n\nResearch and include relevant references, statistics, or examples to support the script.`
    }

    // Create OpenAI model - the API key is automatically read from process.env.OPENAI_API_KEY
    const model = openai("gpt-4o")

    // Generate the script using OpenAI
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    })

    // Extract a title from the script
    const titleResult = await generateText({
      model,
      prompt: `Based on this script, generate a catchy, SEO-friendly title for a YouTube video (just the title, no quotes or explanations):\n\n${text.substring(0, 500)}...`,
    })

    // Update the user's credits
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: profileData.credits - 1 })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating credits:", updateError)
      // Continue anyway to return the generated script
    }

    return NextResponse.json({
      script: text,
      title: titleResult.text.trim(),
    })
  } catch (error: any) {
    console.error("Error generating script:", error)
    return NextResponse.json({ error: "Failed to generate script", message: error.message }, { status: 500 })
  }
}
