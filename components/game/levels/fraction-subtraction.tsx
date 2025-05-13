"use client"

import { useState } from "react"
import Image from "next/image"

export function FractionSubtraction() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "LESSMORE BRIDGE",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "The compass brought me here... but the bridge is broken!"
          </p>
          <div className="flex justify-center my-4">
            <Image 
              src="/pixel-locations/lessmoore-bridge.png" 
              alt="Lessmoore Bridge" 
              width={300} 
              height={200} 
              className="rounded-lg shadow-md"
            />
          </div>
          <p className="text-lg">
            <span className="font-bold text-gray-700">Elder Pebble:</span> "Only those who understand taking away can rebuild what was lost. You must master the art of fraction subtraction to restore the bridge."
          </p>
        </div>
      )
    },
    {
      title: "Subtracting Fractions with the Same Denominator",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-700">Elder Pebble:</span> "Start with 5 out of 8. Take away 2 of the same kind. What remains?"
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Visual Examples:</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-xl font-bold">5/8 − 2/8 = 3/8</div>
                <div className="flex justify-center mt-2 space-x-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">5/8</div>
                  </div>
                  <div className="text-xl flex items-center">−</div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">2/8</div>
                  </div>
                  <div className="text-xl flex items-center">=</div>
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="text-lg">3/8</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">3/4 − 1/4 = 2/4 → 1/2</div>
                <div className="flex justify-center mt-2 space-x-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">3/4</div>
                  </div>
                  <div className="text-xl flex items-center">−</div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">1/4</div>
                  </div>
                  <div className="text-xl flex items-center">=</div>
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="text-lg">1/2</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">6/6 − 4/6 = 2/6 → 1/3</div>
                <div className="flex justify-center mt-2 space-x-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">6/6</div>
                  </div>
                  <div className="text-xl flex items-center">−</div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-lg">4/6</div>
                  </div>
                  <div className="text-xl flex items-center">=</div>
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="text-lg">1/3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg">
            <span className="font-bold text-blue-700">Whiskers:</span> "So when the parts match, it's like taking blocks from the same pile?"
          </p>
          <p className="text-lg">
            <span className="font-bold text-gray-700">Elder Pebble:</span> "Exactly. When the pieces share a name, you simply subtract the tops. But not all fractions speak the same tongue..."
          </p>
        </div>
      )
    },
    {
      title: "Subtracting Fractions with Unlike Denominators",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-700">Elder Pebble:</span> "When parts differ, you must make them agree. This is the art of the Least Common Denominator."
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Tutorial: Subtracting Using the LCM</h3>
            <p className="font-medium">To subtract 3/4 and 2/5, we must find a common ground.</p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Identify the Denominators: 4 and 5</li>
              <li>Find the Least Common Denominator (LCD):
                <ul className="list-disc pl-5 mt-1">
                  <li>Multiples of 4: 4, 8, 12, 16, 20, ...</li>
                  <li>Multiples of 5: 5, 10, 15, 20, ...</li>
                  <li>LCD = 20</li>
                </ul>
              </li>
              <li>Convert to Equivalent Fractions:
                <ul className="list-disc pl-5 mt-1">
                  <li>3/4 → 15/20 (×5)</li>
                  <li>2/5 → 8/20 (×4)</li>
                </ul>
              </li>
              <li>Subtract the Numerators: 15/20 − 8/20 = 7/20</li>
            </ol>
          </div>
          <p className="text-lg">
            <span className="font-bold text-gray-700">Elder Pebble:</span> "By reshaping the parts, you've brought them to unity. Only then can subtraction begin."
          </p>
        </div>
      )
    },
    {
      title: "Practice Problems",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-700">Elder Pebble:</span> "Try these problems to test your understanding."
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Try It Yourself!</h3>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <div>4/5 − 1/3 = ?</div>
                <div className="text-sm text-gray-600 mt-1">
                  <p>LCD = 15</p>
                  <p>4/5 = 12/15</p>
                  <p>1/3 = 5/15</p>
                  <p>12/15 - 5/15 = 7/15</p>
                </div>
              </li>
              <li>
                <div>7/8 − 3/10 = ?</div>
                <div className="text-sm text-gray-600 mt-1">
                  <p>LCD = 40</p>
                  <p>7/8 = 35/40</p>
                  <p>3/10 = 12/40</p>
                  <p>35/40 - 12/40 = 23/40</p>
                </div>
              </li>
              <li>
                <div>5/6 − 2/9 = ?</div>
                <div className="text-sm text-gray-600 mt-1">
                  <p>LCD = 18</p>
                  <p>5/6 = 15/18</p>
                  <p>2/9 = 4/18</p>
                  <p>15/18 - 4/18 = 11/18</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "Bridge Builder Challenge",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-bold text-gray-700">Elder Pebble:</span> "Build the bridge if you want to pass."
          </p>
          <div className="flex justify-center my-4">
            <Image 
              src="/pixel-locations/lessmoore-bridge.png" 
              alt="Lessmoore Bridge" 
              width={300} 
              height={200} 
 the dialogue content from the script:

\
