import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Check if OpenAI API key is available on the server
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured")
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const { prompt, systemPrompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Create OpenAI model - the API key is automatically read from process.env.OPENAI_API_KEY
    const model = openai("gpt-4o")

    const { text } = await generateText({
      model,
      system: systemPrompt || "You are a helpful assistant.",
      prompt,
    })

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error("OpenAI API error:", error)
    return NextResponse.json({ error: "Failed to generate text", message: error.message }, { status: 500 })
  }
}
