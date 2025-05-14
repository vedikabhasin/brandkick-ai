"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, RefreshCw, ExternalLink, Check, X, AlertTriangle } from "lucide-react"

type DomainStatus = "available" | "unavailable" | "checking" | "idle"

interface NameResult {
  name: string
  domainStatus: DomainStatus
}

export default function StartupNameGenerator() {
  const [description, setDescription] = useState("")
  const [tone, setTone] = useState("modern")
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<NameResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const tones = [
    { id: "creative", label: "Creative" },
    { id: "luxury", label: "Luxury" },
    { id: "playful", label: "Playful" },
    { id: "vcbait", label: "VC Bait" },
    { id: "magical", label: "Magical" },
    { id: "practical", label: "Practical" },
    { id: "inclusive", label: "Inclusive" },
  ]

  const handleGenerate = async () => {
    if (!description.trim()) return

    setIsGenerating(true)
    setResults([])
    setError(null)

    try {
      // Call the generate names API
      const response = await fetch("/api/generate-names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, tone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate names")
      }

      if (!data.names || !Array.isArray(data.names)) {
        throw new Error("Invalid response format from API")
      }

      const initialResults = data.names.map((name: string) => ({
        name,
        domainStatus: "idle" as DomainStatus,
      }))

      setResults(initialResults)

      // Check domain availability for each name
      for (let i = 0; i < initialResults.length; i++) {
        const result = { ...initialResults[i], domainStatus: "checking" as DomainStatus }
        setResults((prev) => [...prev.slice(0, i), result, ...prev.slice(i + 1)])

        try {
          const available = await checkDomainAvailability(initialResults[i].name)
          const updatedResult = {
            ...result,
            domainStatus: available ? "available" : ("unavailable" as DomainStatus),
          }
          setResults((prev) => [...prev.slice(0, i), updatedResult, ...prev.slice(i + 1)])
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error checking domain"
          console.error(errorMessage)

          const updatedResult = {
            ...result,
            domainStatus: "idle" as DomainStatus,
          }
          setResults((prev) => [...prev.slice(0, i), updatedResult, ...prev.slice(i + 1)])
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("Error generating names:", errorMessage)
      setError(errorMessage)
      setResults([])
    } finally {
      setIsGenerating(false)
    }
  }

  const checkDomainAvailability = async (name: string): Promise<boolean> => {
    const response = await fetch(`/api/check-domain?name=${encodeURIComponent(name)}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to check domain availability")
    }

    return data.available
  }

  const handleRegenerateNames = () => {
    handleGenerate()
  }

  const getDomainStatusIcon = (status: DomainStatus) => {
    switch (status) {
      case "available":
        return <Check className="h-4 w-4 text-green-500" />
      case "unavailable":
        return <X className="h-4 w-4 text-red-500" />
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      default:
        return null
    }
  }

  const openDomainRegistrar = (name: string) => {
    window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${name}.com`, "_blank")
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Startup Starter :o</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Get names and instantly check for domain availability</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardDescription>Describe your startup briefly (shame if you can't do that)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Input
                id="description"
                placeholder="e.g., AI-powered productivity tools for remote teams"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Tone</label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <Badge
                    key={t.id}
                    variant={tone === t.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTone(t.id)}
                  >
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isGenerating || !description.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "gimme some"
            )}
          </Button>
        </CardFooter>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Names</CardTitle>
              <CardDescription>Click on a name to check domain availability</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRegenerateNames} disabled={isGenerating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="font-medium text-lg">{result.name}</div>
                    <div className="flex items-center space-x-2">
                      {getDomainStatusIcon(result.domainStatus)}
                      <span className="text-sm">
                        {result.domainStatus === "available" && "Available"}
                        {result.domainStatus === "unavailable" && "Unavailable"}
                        {result.domainStatus === "checking" && "Checking..."}
                        {result.domainStatus === "idle" && ""}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 flex justify-between items-center border-t">
                    <div className="text-sm text-gray-500">{result.name}.com</div>
                    <Button variant="ghost" size="sm" onClick={() => openDomainRegistrar(result.name)}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Check
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
