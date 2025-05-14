import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const name = url.searchParams.get("name")

  if (!name) {
    return NextResponse.json({ error: "Missing required parameter: name" }, { status: 400 })
  }

  console.log(`[API] Checking domain availability for: ${name}`)

  try {
    // This is a simulation for demo purposes
    // In production, you would replace this with a real API call
    const domainName = name.toLowerCase().trim()

    // Simulate API call with consistent results based on name characteristics
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Deterministic availability based on name properties
    const isAvailable =
      domainName.length > 5 && // Longer names more likely available
      !/[aeiou]{3,}/.test(domainName) && // Names with too many vowels in a row less available
      domainName.length % 2 === 0 // Even length names more available

    console.log(`[API] Result for ${name}: ${isAvailable ? "Available" : "Unavailable"}`)

    return NextResponse.json({ available: isAvailable })
  } catch (error) {
    console.error(`[API] Error checking domain ${name}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check domain availability" },
      { status: 500 },
    )
  }
}
