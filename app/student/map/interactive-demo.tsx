"use client"

import { useState } from "react"
import Image from "next/image"
import { WorldMap } from "@/components/game/world-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function InteractiveMapDemo() {
  const [locations, setLocations] = useState([
    {
      id: "arithmetown",
      name: "Arithmetown",
      position: "top-[35%] left-[25%]",
      unlocked: true,
      completed: true,
    },
    {
      id: "lessmoore-bridge",
      name: "Lessmoore Bridge",
      position: "top-[45%] left-[50%]",
      unlocked: true,
      completed: false,
    },
    {
      id: "fraction-forest",
      name: "Fraction Forest",
      position: "top-[30%] right-[25%]",
      unlocked: true,
      completed: false,
    },
    {
      id: "dreadpoint-hollow",
      name: "Dreadpoint Hollow",
      position: "bottom-[30%] right-[25%]",
      unlocked: false,
      completed: false,
    },
    {
      id: "realm-of-balance",
      name: "Realm of Balance",
      position: "bottom-[35%] left-[25%]",
      unlocked: false,
      completed: false,
    },
  ])

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId)
    setShowInfo(true)
  }

  const completeLocation = (locationId: string) => {
    setLocations(
      locations.map((loc) => {
        // Mark the current location as completed
        if (loc.id === locationId) {
          return { ...loc, completed: true }
        }

        // Unlock the next locations based on the game's progression
        if (locationId === "arithmetown" && loc.id === "lessmoore-bridge") {
          return { ...loc, unlocked: true }
        }
        if (locationId === "lessmoore-bridge" && loc.id === "fraction-forest") {
          return { ...loc, unlocked: true }
        }
        if (locationId === "fraction-forest" && loc.id === "dreadpoint-hollow") {
          return { ...loc, unlocked: true }
        }
        if (locationId === "dreadpoint-hollow" && loc.id === "realm-of-balance") {
          return { ...loc, unlocked: true }
        }

        return loc
      }),
    )
    setShowInfo(false)
  }

  const resetProgress = () => {
    setLocations([
      {
        id: "arithmetown",
        name: "Arithmetown",
        position: "top-[35%] left-[25%]",
        unlocked: true,
        completed: false,
      },
      {
        id: "lessmoore-bridge",
        name: "Lessmoore Bridge",
        position: "top-[45%] left-[50%]",
        unlocked: false,
        completed: false,
      },
      {
        id: "fraction-forest",
        name: "Fraction Forest",
        position: "top-[30%] right-[25%]",
        unlocked: false,
        completed: false,
      },
      {
        id: "dreadpoint-hollow",
        name: "Dreadpoint Hollow",
        position: "bottom-[30%] right-[25%]",
        unlocked: false,
        completed: false,
      },
      {
        id: "realm-of-balance",
        name: "Realm of Balance",
        position: "bottom-[35%] left-[25%]",
        unlocked: false,
        completed: false,
      },
    ])
    setSelectedLocation(null)
    setShowInfo(false)
  }

  const getLocationInfo = (locationId: string) => {
    switch (locationId) {
      case "arithmetown":
        return {
          title: "Arithmetown",
          description:
            "The starting point of your journey. Here, you'll learn the basics of fractions with Squeaks at the Fraction Emporium.",
          challenges: ["Introduction to Fractions", "Improper Fractions", "Mixed Numbers"],
          image: "/pixel-locations/arithmetown.png",
        }
      case "lessmoore-bridge":
        return {
          title: "Lessmoore Bridge",
          description:
            "A once-grand bridge now missing sections. Elder Pebble will teach you about fraction subtraction to restore it.",
          challenges: ["Subtracting Like Fractions", "Finding Common Denominators", "Bridge Restoration Challenge"],
          image: "/pixel-locations/lessmoore-bridge.png",
        }
      case "fraction-forest":
        return {
          title: "Fraction Forest",
          description:
            "A magical forest where trees grow in perfect fractional patterns. Learn to multiply fractions to navigate through.",
          challenges: ["Multiplying Fractions", "Fraction of a Fraction", "Forest Navigation Challenge"],
          image: "/pixel-locations/fraction-forest.png",
        }
      case "dreadpoint-hollow":
        return {
          title: "Dreadpoint Hollow",
          description:
            "A mysterious cavern where decimal shadows lurk. Master division of fractions to dispel the darkness.",
          challenges: ["Dividing Fractions", "Reciprocals", "Shadow Banishing Challenge"],
          image: "/pixel-locations/dreadpoint-hollow.png",
        }
      case "realm-of-balance":
        return {
          title: "Realm of Balance",
          description:
            "The final area where you'll face the Decimal Phantom and restore the Fraction Orb by mastering equivalent fractions.",
          challenges: ["Equivalent Fractions", "Simplifying Fractions", "Final Orb Restoration"],
          image: "/pixel-locations/realm-of-balance.png",
        }
      default:
        return {
          title: "",
          description: "",
          challenges: [],
          image: "",
        }
    }
  }

  const selectedLocationInfo = selectedLocation ? getLocationInfo(selectedLocation) : null
  const selectedLocationData = locations.find((loc) => loc.id === selectedLocation)

  return (
    <div className="p-4 bg-gradient-to-b from-amber-100 to-amber-200 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900">Kingdom of Numeria</h1>
          <Button variant="outline" onClick={resetProgress}>
            Reset Progress
          </Button>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg shadow-lg mb-6">
          <WorldMap
            locations={locations}
            currentLocationId={selectedLocation || undefined}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {showInfo && selectedLocationInfo && selectedLocationData && (
          <Card className="border-2 border-amber-800 bg-amber-50 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 bg-amber-100 rounded-lg p-2 flex items-center justify-center">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={selectedLocationInfo.image || "/placeholder.svg?height=200&width=200&query=fantasy location"}
                      alt={selectedLocationInfo.title}
                      fill
                      className="object-cover rounded pixelated"
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h2 className="text-xl font-bold text-amber-900 mb-2">{selectedLocationInfo.title}</h2>
                  <p className="text-amber-800 mb-4">{selectedLocationInfo.description}</p>

                  <h3 className="font-bold text-amber-900 mb-2">Challenges:</h3>
                  <ul className="list-disc pl-5 mb-4">
                    {selectedLocationInfo.challenges.map((challenge, index) => (
                      <li key={index} className="text-amber-800">
                        {challenge}
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-end">
                    {!selectedLocationData.completed && selectedLocationData.unlocked && (
                      <Button
                        onClick={() => completeLocation(selectedLocation)}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Complete Location
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
          <h2 className="font-bold text-amber-900 mb-2">How to Use the Map:</h2>
          <ul className="list-disc pl-5 text-amber-800">
            <li>Hover over locations to see them rise up</li>
            <li>Click on an unlocked location to view details</li>
            <li>Complete locations to unlock new areas</li>
            <li>Green markers indicate completed areas</li>
            <li>Yellow markers show available locations</li>
            <li>Locked locations have a padlock icon</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
