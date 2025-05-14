import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { NextResponse } from "next/server"

// Define the schema for the response
const namesSchema = z.object({
  names: z.array(z.string()).min(1).max(10),
})

export async function POST(request: Request) {
  console.log("[API] /api/generate-names called")

  try {
    // Parse the request body
    const body = await request.json()
    const { description, tone } = body

    if (!description || !tone) {
      return NextResponse.json({ error: "Missing required fields: description and tone" }, { status: 400 })
    }

    console.log(`[API] Processing request with description: "${description}", tone: "${tone}"`)

    // Define tone descriptions
    const toneDescriptions = {
      creative: "creative, innovative, and original",
      luxury: "luxurious, high-end, and sophisticated",
      playful: "fun, playful, and approachable",
      vcbait: "venture capital friendly, disruptive, and scalable",
      magical: "magical, enchanting, and whimsical",
      practical: "practical, straightforward, and functional",
      inclusive: "inclusive, welcoming, and community-oriented",
    }

    // Get the tone description
    const toneDescription = toneDescriptions[tone as keyof typeof toneDescriptions] || toneDescriptions.modern
    console.log(`[API] Using tone description: "${toneDescription}"`)

    // Generate names using Google's Gemini with structured output
    console.log(`[API] Calling Gemini model...`)
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: namesSchema,
      system: `You are a startup name generator specialized in creating aesthetic, memorable names.
      
      For each request:
      1. Generate exactly 6 unique startup names based on the description and tone provided
      2. Names should be short (1-2 words), memorable, and brandable
      3. Include a mix of real words, compound words, and made-up words
      4. Focus on names that would work well as domain names
      5. Return ONLY the names in the specified JSON format
      
      Examples of good names: Stripe, Notion, Vercel, Figma, Slack, Airtable, Canva, blvnk, nuvem, GrainWorks`,
      prompt: `Create 6 startup names for a company that does: ${description}. 
      The tone should be: ${toneDescription}.
      Return only the names in the specified JSON format.`,
    })

    console.log(`[API] Gemini response received:`, result)

    // Return the names array from the result
    return NextResponse.json({ names: result.object.names.slice(0, 6) })
  } catch (error) {
    console.error("[API] Error generating names:", error)
    // Return the error message to the client
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate names" },
      { status: 500 },
    )
  }
}
