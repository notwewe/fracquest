import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { BackgroundSlideshow } from "@/components/auth/background-slideshow"
import Image from "next/image"

// Location data with descriptions
const locationData = {
  1: {
    name: "Arithmetown Castle",
    image: "/Prac_Arithmetown.png",
    description:
      "Welcome to Arithmetown, the bustling heart of Numeria Kingdom! Here, the citizens have mastered the art of fraction manipulation. Learn how to convert improper fractions into mixed numbers, add fractions with different denominators, and solve puzzles that challenge your understanding of parts and wholes. The town's mathematicians are eager to share their knowledge with brave adventurers like you!",
  },
  2: {
    name: "Lessmore Bridge",
    image: "/Prac_Lessmore.png",
    description:
      "Cross the ancient Lessmore Bridge, where the guardians of comparison dwell! This mystical bridge teaches travelers the sacred art of comparing fractions. Learn to determine which fraction is greater or lesser, master the symbols of inequality, and discover the secrets of ordering fractions from smallest to largest. Only those who understand the true relationships between fractions may safely cross to the other side!",
  },
  3: {
    name: "Fraction Forest",
    image: "/Prac_FractionForest.png",
    description:
      "Enter the enchanted Fraction Forest, where every tree represents a different part of the whole! In this magical woodland, you'll learn the fundamental concepts of fractions. Discover how to identify numerators and denominators, understand what fractions represent, and practice recognizing fractions in everyday objects. The forest spirits will guide you through the basics of fractional thinking!",
  },
  4: {
    name: "Realm of Balance",
    image: "/Prac_RealmOfBalance.png",
    description:
      "Welcome to the Realm of Balance, where harmony and equality reign supreme! Here, the ancient scales of justice teach the mysteries of equivalent fractions. Learn to find fractions that represent the same value, master the art of simplifying fractions to their lowest terms, and discover how to create equivalent fractions by multiplying or dividing. Balance is the key to unlocking these mathematical secrets!",
  },
  5: {
    name: "Dreadpoint Hollow",
    image: "/placeholder.svg?height=280&width=280",
    description:
      "Venture into the shadowy depths of Dreadpoint Hollow, where the most challenging fraction mysteries await! This treacherous realm tests your mastery of complex fraction operations. Face the trials of subtracting fractions with unlike denominators, solve multi-step fraction problems, and conquer the fearsome mixed number conversions. Only the bravest mathematicians dare to enter these dark caverns!",
  },
}

export default async function StudentPracticePage({
  searchParams,
}: {
  searchParams: { location?: string }
}) {
  const supabase = createClient()

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

  // Get game sections
  const { data: sections } = await supabase.from("game_sections").select("*").order("order_index")

  // Get current location (default to first section or Arithmetown)
  const currentLocationId = searchParams.location ? Number.parseInt(searchParams.location) : 1
  const currentLocation = locationData[currentLocationId as keyof typeof locationData] || locationData[1]

  // Get current section for navigation
  const currentSection = sections?.find((s) => s.id === currentLocationId) || sections?.[0]

  // Navigation logic
  const currentIndex = sections?.findIndex((s) => s.id === currentLocationId) || 0
  const previousSection = currentIndex > 0 ? sections?.[currentIndex - 1] : null
  const nextSection = currentIndex < (sections?.length || 0) - 1 ? sections?.[currentIndex + 1] : null

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Slideshow */}
      <BackgroundSlideshow />

      {/* Back to Dashboard Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button asChild variant="outline" className="font-blaka border-amber-600 text-black bg-amber-50/90 text-lg">
          <Link href="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Title - Added above the book */}
        <h1
          className="text-8xl font-bold text-center mb-0 mt-20"
          style={{
            fontFamily: "var(--font-blaka)",
            color: "#FFFFFF", // White color
            WebkitTextStroke: "3px #000000", // Black outline (increased thickness)
            textStroke: "3px #000000", // Black outline (for non-webkit browsers)
            textShadow: "4px 4px 8px rgba(0, 0, 0, 0.5)", // Enhanced shadow for better visibility
          }}
        >
          Practice
        </h1>

        {/* Book Container - Same size as login */}
        <div className="relative -mt-5">
          <Image src="/book.png" alt="Open Book" width={800} height={600} className="w-full h-auto max-w-4xl mx-auto" />

          {/* Book Content - Positioned inside the book */}
          <div className="absolute top-[12%] left-[8%] right-[8%] bottom-[15%] flex flex-col">
            {/* Content Area - Top 70% */}
            <div className="flex flex-1" style={{ height: "70%" }}>
              {/* Left Page */}
              <div className="flex-1 pr-8">
                {/* Left Page Content - Increased height */}
                <div className="font-blaka text-black mt-16 h-[320px] overflow-y-auto">
                  <p className="text-xl leading-relaxed">{currentLocation.description}</p>
                </div>
              </div>

              {/* Right Page */}
              <div className="flex-1 pl-8">
                {/* Right Page Content - Title moved down */}
                <div className="flex flex-col items-center">
                  <h1 className="text-7xl font-blaka text-black mb-8 mt-8 transform">{currentLocation.name}</h1>
                  <div className="h-[180px] flex items-center justify-center">
                    <Image
                      src={currentLocation.image || "/placeholder.svg"}
                      alt={`${currentLocation.name} Location`}
                      width={280}
                      height={280}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Button Area - Bottom 30%, moved up significantly */}
            <div className="flex -mt-16" style={{ height: "30%" }}>
              {/* Left Page Button - Moved slightly to the left */}
              <div className="flex-1 flex justify-center pr-6">
                <Button
                  asChild
                  className="w-4/5 font-blaka bg-amber-800 hover:bg-amber-900 text-amber-100 text-lg py-3 shadow-md shadow-amber-950/40"
                >
                  <Link href={currentSection ? `/student/practice/${currentSection.id}/intro` : "#"}>
                    Review Lesson
                  </Link>
                </Button>
              </div>

              {/* Right Page Button - Moved slightly to the right */}
              <div className="flex-1 flex justify-center pl-6">
                <Button
                  asChild
                  className="w-4/5 font-blaka bg-amber-800 hover:bg-amber-900 text-amber-100 text-lg py-3 shadow-md shadow-amber-950/40"
                >
                  <Link href={currentSection ? `/student/practice/${currentSection.id}/game` : "#"}>Practice Game</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Previous Button - Positioned outside the book, on the left side */}
        <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-20">
          {previousSection ? (
            <Link href={`/student/practice?location=${previousSection.id}`} className="block w-24 h-24">
              <Image
                src="/nav-arrow.png"
                alt="Previous"
                width={128}
                height={128}
                className="hover:opacity-80 transition-opacity"
              />
            </Link>
          ) : (
            <div className="w-24 h-24 opacity-50">
              <Image src="/nav-arrow.png" alt="Previous" width={128} height={128} />
            </div>
          )}
        </div>
        
        {/* Next Button - Positioned outside the book, on the right side */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-20">
          {nextSection ? (
            <Link href={`/student/practice?location=${nextSection.id}`} className="block w-24 h-24">
              <Image
                src="/nav-arrow.png"
                alt="Next"
                width={128}
                height={128}
                className="transform scale-x-[-1] hover:opacity-80 transition-opacity"
              />
            </Link>
          ) : (
            <div className="w-24 h-24 opacity-50">
              <Image src="/nav-arrow.png" alt="Next" width={128} height={128} className="transform scale-x-[-1]" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}