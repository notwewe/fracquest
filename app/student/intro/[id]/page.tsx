import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { FractionTutorial } from "@/components/game/fraction-tutorial"
import { StoryScene } from "@/components/game/story-scene"

export default async function IntroPage(props: any) {
  const { params } = await props;
  const supabase = createClient()
  const waypointId = Number.parseInt(params.id)

  if (isNaN(waypointId)) {
    return notFound()
  }

  // Check if user is authenticated and is a student
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

  if (!profile || profile.role_id !== 1) {
    redirect("/auth/login")
  }

  // Get waypoint details
  const { data: waypoint, error: waypointError } = await supabase
    .from("waypoints")
    .select(`
      *,
      game_sections:section_id (
        name,
        description
      )
    `)
    .eq("id", waypointId)
    .single()

  if (waypointError || !waypoint) {
    return notFound()
  }

  // Get content based on waypoint
  const content = getIntroContent(waypoint)

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="outline" className="font-pixel border-amber-600 text-amber-700">
          <Link href="/student/map">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-pixel text-amber-900">{waypoint.name}</h1>
          <p className="text-amber-700">{waypoint.game_sections.name} - Introduction</p>
        </div>

        <Card className="border-2 border-amber-800 bg-amber-50">
          <CardContent className="p-0">
            {content.type === "story" ? (
              <StoryScene
                title={content.title}
                dialogues={content.dialogues}
                nextRoute={`/student/game/${waypointId}`}
              />
            ) : (
              <FractionTutorial
                title={content.title}
                description={content.description}
                steps={content.steps}
                onComplete={() => {
                  window.location.href = `/student/game/${waypointId}`
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to get intro content based on waypoint
function getIntroContent(waypoint: any) {
  // Determine which content to show based on waypoint ID or section
  if (waypoint.name === "Fraction Basics") {
    return {
      type: "story",
      title: "Welcome to Squeaks' Fraction Emporium",
      dialogues: [
        {
          speaker: "Narrator",
          text: "Whiskers pushes open the door, and a little bell jingles. Squeaks, a tiny mouse with big glasses and a merchant's apron, hops onto the counter.",
          image: "/fantasy-mouse-shop.png",
        },
        {
          speaker: "Squeaks",
          text: "Well, hello there, traveler! Welcome to Squeaks' Fraction Emporium, home to the finest fraction gadgets in all of Numeria!",
          image: "/mouse-shopkeeper.png",
        },
        {
          speaker: "Whiskers",
          text: "I heard this is where math meets magic. I'm trying to learn more about fractions—heard they're the key to saving the kingdom!",
          image: "/cat-adventurer-shop.png",
        },
        {
          speaker: "Squeaks",
          text: "Then you've come to the right place! Fractions are all about parts of a whole. Let me show you!",
          image: "/mouse-fractions.png",
        },
        {
          speaker: "Squeaks",
          text: "If I eat one slice of this cheese wheel that's cut into 4 equal parts, I've eaten 1 out of 4... or 1/4. The top number tells us how many slices we have, and the bottom number tells us how many equal slices the whole cheese had!",
          image: "/cheese-wheel-quarters.png",
        },
        {
          speaker: "Whiskers",
          text: "So fractions are just parts of something bigger?",
          image: "/placeholder.svg?height=200&width=400&query=cat looking curious",
        },
        {
          speaker: "Squeaks",
          text: "Exactly! Once you understand how they work, you can compare them, add them, and even use them in magic! Now that you get the basics, it's time for something bigger…",
          image: "/placeholder.svg?height=200&width=400&query=mouse excited about fractions",
        },
      ],
    }
  } else if (waypoint.name === "Improper to Mixed") {
    return {
      type: "tutorial",
      title: "Improper and Mixed Fractions",
      description: "Learn how to convert between improper fractions and mixed numbers",
      steps: [
        {
          title: "The Overflowing Cheese Crate",
          content:
            "Squeaks walks toward a glowing cheese crate that's bursting at the seams with more slices than it seems it can hold.",
          image: "/placeholder.svg?height=200&width=400&query=overflowing cheese crate",
        },
        {
          title: "What is an Improper Fraction?",
          content:
            "An improper fraction is when the number on top (numerator) is bigger than the number on the bottom (denominator).\n\nFor example, 7/4 is an improper fraction because 7 is greater than 4.",
          example:
            "If each cheese wheel has 4 slices, and I have 7 slices, I've got 7/4. That's more than a whole cheese!",
        },
        {
          title: "Converting Improper Fractions to Mixed Numbers",
          content: "A mixed number shows how many whole items you have, plus what's left over as a fraction.",
          steps: [
            "Divide the numerator by the denominator",
            "The quotient is the whole number part",
            "The remainder is the new numerator",
            "Keep the same denominator",
          ],
          example: "7/4 = 1 3/4\n(7 ÷ 4 = 1 remainder 3)",
        },
        {
          title: "Converting Mixed Numbers to Improper Fractions",
          content: "We can also convert mixed numbers back to improper fractions.",
          steps: ["Multiply the whole number by the denominator", "Add the numerator", "Keep the same denominator"],
          example: "2 2/5 = 12/5\n(2 × 5 = 10, 10 + 2 = 12)",
        },
      ],
    }
  } else if (waypoint.name === "Addition Intro") {
    return {
      type: "tutorial",
      title: "Assembling the Fraction Compass",
      description: "Learn how to add fractions to complete the magical compass",
      steps: [
        {
          title: "The Compass Chamber",
          content:
            "Squeaks leads you to the heart of the Emporium—the Fraction Compass Chamber. The compass is ancient, scattered, and broken into pieces that are—quite fittingly—fractions of a whole.",
          image: "/placeholder.svg?height=200&width=400&query=magical compass pieces",
        },
        {
          title: "Adding Fractions with the Same Denominator",
          content: "When you add fractions with the same bottom number—the denominator—you just add the top numbers!",
          example: "1/4 + 2/4 = 3/4\n2/8 + 5/8 = 7/8",
        },
        {
          title: "Adding Fractions with Different Denominators",
          content: "When the denominators are different, we need to find a common denominator first.",
          steps: [
            "Look at both denominators",
            "Find the Least Common Denominator (LCD) – the smallest number both can divide into",
            "Rewrite each fraction so they have this shared denominator",
            "Then, add the numerators like usual!",
          ],
          example: "1/2 + 1/4 = ?\nDenominators: 2 and 4\nLCD = 4\nConvert 1/2 to 2/4\nNow add: 2/4 + 1/4 = 3/4",
        },
        {
          title: "Another Example",
          content: "Let's try another example with different denominators.",
          example: "2/3 + 1/6 = ?\nDenominators: 3 and 6\nLCD = 6\nConvert 2/3 to 4/6\nNow add: 4/6 + 1/6 = 5/6",
        },
      ],
    }
  } else if (waypoint.name === "Subtraction Intro") {
    return {
      type: "story",
      title: "Lessmore Bridge",
      dialogues: [
        {
          speaker: "Narrator",
          text: "Whiskers arrives at the edge of a misty ravine. A grand, glowing bridge once stood here—but now, parts of it are missing.",
          image: "/placeholder.svg?height=200&width=400&query=broken magical bridge over ravine",
        },
        {
          speaker: "Narrator",
          text: "The compass pulses and glows. Whiskers steps cautiously to the ravine's edge.",
          image: "/placeholder.svg?height=200&width=400&query=cat with glowing compass",
        },
        {
          speaker: "Whiskers",
          text: "The compass brought me here... but the bridge is broken!",
          image: "/placeholder.svg?height=200&width=400&query=cat looking at broken bridge",
        },
        {
          speaker: "Elder Pebble",
          text: "Only those who understand taking away can rebuild what was lost. You must master the art of fraction subtraction to restore the bridge.",
          image: "/placeholder.svg?height=200&width=400&query=ancient stone guardian",
        },
        {
          speaker: "Elder Pebble",
          text: "Start with 5 out of 8. Take away 2 of the same kind. What remains?",
          image: "/placeholder.svg?height=200&width=400&query=stone plate with glowing fractions",
        },
        {
          speaker: "Whiskers",
          text: "So when the parts match, it's like taking blocks from the same pile?",
          image: "/placeholder.svg?height=200&width=400&query=cat thinking about fractions",
        },
        {
          speaker: "Elder Pebble",
          text: "Exactly. When the pieces share a name, you simply subtract the tops. But not all fractions speak the same tongue…",
          image: "/placeholder.svg?height=200&width=400&query=stone guardian teaching",
        },
      ],
    }
  } else {
    // Default tutorial for other intro waypoints
    return {
      type: "tutorial",
      title: waypoint.name,
      description: waypoint.description || "Learn about fractions in this tutorial",
      steps: [
        {
          title: "Introduction",
          content:
            "Welcome to this fraction tutorial! You'll learn important concepts that will help you on your journey.",
          image: "/placeholder.svg?height=200&width=400&query=fantasy classroom with fractions",
        },
        {
          title: "Basic Concepts",
          content:
            "Fractions represent parts of a whole. The top number (numerator) tells how many parts we have, and the bottom number (denominator) tells how many equal parts the whole is divided into.",
          example: "In the fraction 3/4, we have 3 out of 4 equal parts.",
        },
        {
          title: "Practice Time",
          content: "Now it's time to practice what you've learned with some interactive exercises.",
          steps: ["Read each problem carefully", "Apply the concepts you've learned", "Check your work"],
        },
      ],
    }
  }
}
