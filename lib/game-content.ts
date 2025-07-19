import { FractionIntroduction } from "@/components/game/levels/fraction-introduction"
import { ImproperFractionsStory } from "@/components/game/levels/improper-fractions-story"
import { AdditionIntroductionStory } from "@/components/game/levels/addition-introduction-story"
import { SubtractionIntroductionStory } from "@/components/game/levels/subtraction-introduction-story"
import ConversionGame from "@/components/game/levels/conversion-game"
import AdditionGame from "@/components/game/levels/addition-game"
import BridgeBuilderGame from "@/components/game/levels/bridge-builder-game"
import FractionForestGame from "@/components/game/levels/fraction-forest-game"
import RealmOfBalanceGame from "@/components/game/levels/realm-of-balance-game"
import DreadpointHollowGame from "@/components/game/levels/dreadpoint-hollow-game"

export const gameContent = {
  // Arithmetown
  1: FractionIntroduction,
  2: ImproperFractionsStory,
  3: ConversionGame,
  4: AdditionIntroductionStory,
  5: AdditionGame,

  // Lessmore Bridge
  6: SubtractionIntroductionStory,
  7: BridgeBuilderGame,

  // Fraction Forest
  8: FractionForestGame,

  // Realm of Balance
  9: RealmOfBalanceGame,

  // Dreadpoint Hollow
  10: DreadpointHollowGame,

  // Epilogue (handled within Dreadpoint Hollow game)
  11: DreadpointHollowGame,
}

export const levelNames = {
  1: "Fraction Introduction",
  2: "Improper and Mixed Fractions",
  3: "Conversion Game",
  4: "Addition Introduction",
  5: "Addition Game",
  6: "Subtraction Introduction",
  7: "Bridge Builder Game",
  8: "Fraction Forest",
  9: "Realm of Balance",
  10: "Dreadpoint Hollow",
  11: "Epilogue",
}

export function getLevelDialogue(levelId: string) {
  // Default dialogue if level-specific dialogue is not found
  const defaultDialogue = [
    {
      speaker: "Narrator",
      text: "You've arrived at a new location in your quest.",
      background: "New Location",
    },
    {
      speaker: "Whiskers",
      text: "I wonder what fraction challenges await me here!",
      background: "New Location",
    },
    {
      speaker: "Narrator",
      text: "Let's continue our adventure and learn more about fractions.",
      background: "New Location",
    },
  ]

  // Level-specific dialogue based on the storyboard PDF
  const levelDialogues: Record<string, any> = {
    // Opening Cutscene
    "0": [
      {
        speaker: "Narrator",
        text: "Welcome to Numeria, a land where balance is everything. But today... chaos has struck!",
        background: "Kingdom of Numeria",
      },
      {
        speaker: "Narrator",
        text: "A glowing orb floats above the palace, radiating harmony. Suddenly, a shadowy figure appears—The Decimal Phantom!",
        background: "Kingdom of Numeria",
      },
      {
        speaker: "Decimal Phantom",
        text: "Mwahaha! With the Fraction Orb shattered, Numeria will never be whole again! Let's see you fix this, little adventurer!",
        background: "Orb Shattering",
      },
      {
        speaker: "Narrator",
        text: "The Decimal Phantom laughs and shatters the Fraction Orb into glowing fraction pieces that scatter across the land.",
        background: "Orb Shattering",
      },
      {
        speaker: "Narrator",
        text: "The screen shakes as bridges crumble and buildings flicker.",
        background: "Crumbling Kingdom",
      },
      {
        speaker: "King Equalis",
        text: "Oh no! Without the Fraction Orb, our world is falling apart! Whiskers, you are our only hope. Retrieve the lost fraction pieces and restore Numeria!",
        background: "Worried King",
      },
      {
        speaker: "Whiskers",
        text: "I won't let Numeria fall! Time to solve some fraction puzzles!",
        background: "Determined Whiskers",
      },
      {
        speaker: "Narrator",
        text: "Whiskers nods and picks up the Fraction Compass, ready to begin the adventure.",
        background: "Adventure Begins",
      },
    ],

    // Arithmetown - Fraction Introduction (Level 1)
    "1": [
      {
        speaker: "Narrator",
        text: "Whiskers enters a small wooden shop with shelves filled with fraction-themed items—half-cheese wheels, quarter-apples, and fraction potions.",
        background: "Fraction Emporium",
      },
      {
        speaker: "Narrator",
        text: "A quaint little wooden shop with shelves packed with fraction-themed items—cheese wheels sliced into parts, labeled potions, pies in slices, and scrolls with numbers and symbols.",
        background: "Fraction Emporium",
      },
      {
        speaker: "Narrator",
        text: "Whiskers pushes open the door, and a little bell jingles. Squeaks, a tiny mouse with big glasses and a merchant's apron, hops onto the counter.",
        background: "Fraction Emporium",
      },
      {
        speaker: "Squeaks",
        text: "Well, hello there, traveler! Welcome to Squeaks' Fraction Emporium, home to the finest fraction gadgets in all of Numeria!",
        background: "Fraction Emporium",
      },
      {
        speaker: "Whiskers",
        text: "I heard this is where math meets magic. I'm trying to learn more about fractions—heard they're the key to saving the kingdom!",
        background: "Fraction Emporium",
      },
      {
        speaker: "Squeaks",
        text: "Then you've come to the right place! Fractions are all about parts of a whole. Let me show you!",
        background: "Fraction Emporium",
      },
      {
        speaker: "Narrator",
        text: "Squeaks pulls out a round cheese wheel and slices it into 4 equal parts.",
        background: "Cheese Wheel Demo",
      },
      {
        speaker: "Squeaks",
        text: "If I eat one slice, I've eaten 1 out of 4... or 1/4. The top number tells us how many slices we have, and the bottom number tells us how many equal slices the whole cheese had!",
        background: "Cheese Wheel Demo",
      },
      {
        speaker: "Squeaks",
        text: "A pie sliced into 8 pieces: 3 slices is 3/8! A potion bottle half full: That's 1/2!",
        background: "Fraction Examples",
      },
      {
        speaker: "Whiskers",
        text: "So fractions are just parts of something bigger?",
        background: "Fraction Emporium",
      },
      {
        speaker: "Squeaks",
        text: "Exactly! Once you understand how they work, you can compare them, add them, and even use them in magic! Now that you get the basics, it's time for something bigger...",
        background: "Fraction Emporium",
      },
      {
        speaker: "Squeaks",
        text: "Now, let's practice with some examples to make sure you've got it!",
        background: "Fraction Practice",
      },
      {
        speaker: "Squeaks",
        text: "If I have a pizza with 8 slices and I eat 3 slices, what fraction of the pizza have I eaten?",
        background: "Fraction Practice",
        isChoice: true,
        choices: ["3/8", "3/5", "5/8", "8/3"],
        correctChoice: 0, // 3/8 is the correct answer (index 0)
        wrongAnswerText:
          "That's not right. Remember, the denominator (bottom number) is the total number of slices, and the numerator (top number) is how many you've eaten.",
      },
      // Correct answer response
      {
        speaker: "Squeaks",
        text: "Correct! 3/8 is the right answer. The denominator (8) tells us how many total slices, and the numerator (3) tells us how many we've eaten.",
        background: "Fraction Practice",
      },
      {
        speaker: "Squeaks",
        text: "Let's try another one. If a potion bottle is 1/4 full, what fraction is empty?",
        background: "Fraction Practice",
        isChoice: true,
        choices: ["1/4", "3/4", "4/1", "4/3"],
        correctChoice: 1, // 3/4 is the correct answer (index 1)
        wrongAnswerText:
          "Not quite. Think about it: if 1/4 is full, what fraction remains empty out of the whole bottle (4/4)?",
      },
      // Correct answer response
      {
        speaker: "Squeaks",
        text: "Excellent! 3/4 is correct. If 1/4 is full, then 3/4 must be empty, since the whole bottle is 4/4 or 1 whole.",
        background: "Fraction Practice",
      },
      {
        speaker: "Squeaks",
        text: "You're getting the hang of this! Let's move on to more advanced fraction concepts.",
        background: "Fraction Practice",
      },
    ],

    // Arithmetown - Improper Fractions (Level 2)
    "2": [
      {
        speaker: "Narrator",
        text: "Deeper into Squeaks' Emporium, a dusty corner reveals a stack of magical crates, each labeled with mysterious numbers and glowing softly.",
        background: "The Overflowing Cheese Crate",
      },
      {
        speaker: "Narrator",
        text: "A sign above reads: 'Fractions That Don't Fit Neatly!'",
        background: "The Overflowing Cheese Crate",
      },
      {
        speaker: "Narrator",
        text: "Whiskers and Squeaks walk toward a glowing cheese crate that's bursting at the seams with more slices than it seems it can hold.",
        background: "The Overflowing Cheese Crate",
      },
      {
        speaker: "Whiskers",
        text: "Whoa! That crate is supposed to hold one cheese wheel, right? But... there are more slices than one wheel!",
        background: "The Overflowing Cheese Crate",
      },
      {
        speaker: "Squeaks",
        text: "Good eye, traveler! What you're looking at is an improper fraction—it's when the number on top, the numerator, is bigger than the number on the bottom, the denominator.",
        background: "The Overflowing Cheese Crate",
      },
      {
        speaker: "Narrator",
        text: "Squeaks pulls out 7 slices from a crate labeled '4-slice cheeses.'",
        background: "Cheese Slices",
      },
      {
        speaker: "Squeaks",
        text: "See? If each cheese wheel has 4 slices, and I have 7 slices, I've got 7/4. That's more than a whole cheese!",
        background: "Improper Fractions",
      },
      {
        speaker: "Whiskers",
        text: "So... what do I do with a fraction like that?",
        background: "Improper Fractions",
      },
      {
        speaker: "Squeaks",
        text: "Well, we turn it into a mixed number! That means we show how many whole cheese wheels you have, and what's left over.",
        background: "Mixed Numbers",
      },
      {
        speaker: "Squeaks",
        text: "Let's turn 7/4 into a mixed number. First, divide the top by the bottom: 7 ÷ 4 = 1 remainder 3. That's 1 whole and 3 left over.",
        background: "Mixed Numbers Step 1",
      },
      {
        speaker: "Squeaks",
        text: "Now we write the mixed number: The whole is 1, and the leftover is 3 slices out of 4. So, 7/4 = 1 3/4!",
        background: "Mixed Numbers Step 2",
      },
      {
        speaker: "Squeaks",
        text: "See? You had one full cheese wheel (4/4) and 3 slices left. So it's 1 3/4!",
        background: "Mixed Numbers",
      },
      {
        speaker: "Whiskers",
        text: "What if I have a mixed number like 2 2/5? How do I turn it back into an improper fraction?",
        background: "Mixed Numbers",
      },
      {
        speaker: "Squeaks",
        text: "Great question! Let's flip it around!",
        background: "Conversion",
      },
      {
        speaker: "Squeaks",
        text: "First, multiply the whole number by the denominator: 2 × 5 = 10",
        background: "Conversion Step 1",
      },
      {
        speaker: "Squeaks",
        text: "Next, add the numerator: 10 + 2 = 12",
        background: "Conversion Step 2",
      },
      {
        speaker: "Squeaks",
        text: "Finally, keep the same denominator. So, 2 2/5 = 12/5",
        background: "Conversion Step 3",
      },
      {
        speaker: "Squeaks",
        text: "Simple, right? You're just counting all the slices from full cheese wheels and the extra ones!",
        background: "Conversion",
      },
      {
        speaker: "Whiskers",
        text: "That's not so hard when you break it down like that. Let's play that conversion game now—I'm ready!",
        background: "Conversion",
      },
      {
        speaker: "Squeaks",
        text: "Let's see how fast your brain and paws can work together! To the Sorting Table!",
        background: "Conversion",
      },
      {
        speaker: "Squeaks",
        text: "Convert 9/4 to a mixed number.",
        background: "Conversion Practice",
        isChoice: true,
        choices: ["2 1/4", "2 1/2", "2 1/3", "2 1/5"],
        correctChoice: 0, // 2 1/4 is the correct answer (index 0)
        wrongAnswerText:
          "Not quite. To convert 9/4 to a mixed number, divide 9 by 4. You get 2 with a remainder of 1, so it's 2 1/4.",
      },
      // Correct answer response
      {
        speaker: "Squeaks",
        text: "Excellent! 9/4 = 2 1/4 because 9 ÷ 4 = 2 remainder 1.",
        background: "Conversion Practice",
      },
      {
        speaker: "Squeaks",
        text: "Now convert 3 2/5 to an improper fraction.",
        background: "Conversion Practice",
        isChoice: true,
        choices: ["15/5", "17/5", "12/5", "7/5"],
        correctChoice: 1, // 17/5 is the correct answer (index 1)
        wrongAnswerText:
          "That's not right. To convert 3 2/5 to an improper fraction, multiply 3 by 5 to get 15, then add 2 to get 17. So it's 17/5.",
      },
      // Correct answer response
      {
        speaker: "Squeaks",
        text: "Perfect! 3 2/5 = 17/5 because (3 × 5) + 2 = 17.",
        background: "Conversion Practice",
      },
    ],

    // Arithmetown - Conversion Game (Level 3)
    "3": [
      {
        speaker: "Squeaks",
        text: "Welcome to the Sorting Table! Here, you'll test your knowledge by converting fractions. Don't worry—I'll guide you through the first round!",
        background: "Squeaks' Sorting Table",
      },
      {
        speaker: "Squeaks",
        text: "You'll need to convert between improper fractions and mixed numbers. Remember: divide to go from improper to mixed, multiply and add to go from mixed to improper!",
        background: "Squeaks' Sorting Table",
      },
    ],

    // Arithmetown - Addition Intro (Level 4)
    "4": [
      {
        speaker: "Narrator",
        text: "The back room of the Emporium. A floating pedestal glows, waiting for the compass pieces to be placed.",
        background: "Assembling the Fraction Compass",
      },
      {
        speaker: "Squeaks",
        text: "If you can fix the compass, then you shall continue on your journey to restore the Fraction Orb!",
        background: "Assembling the Fraction Compass",
      },
      {
        speaker: "Squeaks",
        text: "When you add fractions with the same bottom number—the denominator—you just add the top numbers!",
        background: "Fraction Addition",
      },
      {
        speaker: "Squeaks",
        text: "For example: 1/4 + 2/4 = 3/4 and 2/8 + 5/8 = 7/8",
        background: "Fraction Addition",
      },
      {
        speaker: "Squeaks",
        text: "When the denominators are different, we need to do a little more work.",
        background: "Fraction Addition",
      },
      {
        speaker: "Squeaks",
        text: "Look at both denominators. Find the Least Common Denominator (LCD) – the smallest number both can divide into. Rewrite each fraction so they have this shared denominator. Then, add the numerators like usual!",
        background: "Common Denominators",
      },
      {
        speaker: "Squeaks",
        text: "For example, 1/2 + 1/4 = ? The denominators are 2 and 4. The LCD is 4. Convert 1/2 to 2/4. Now add: 2/4 + 1/4 = 3/4",
        background: "Common Denominators",
      },
      {
        speaker: "Squeaks",
        text: "Another example: 2/3 + 1/6 = ? The denominators are 3 and 6. The LCD is 6. Convert 2/3 to 4/6. Now add: 4/6 + 1/6 = 5/6",
        background: "Common Denominators",
      },
      {
        speaker: "Whiskers",
        text: "So to assemble the compass, I just need to know how much I've added so far?",
        background: "Assembling the Fraction Compass",
      },
      {
        speaker: "Squeaks",
        text: "Precisely! But be careful—only the exact total will activate it!",
        background: "Assembling the Fraction Compass",
      },
      {
        speaker: "Squeaks",
        text: "Let's try a practice problem. What is 1/3 + 1/3?",
        background: "Addition Practice",
        isChoice: true,
        choices: ["1/3", "2/3", "2/6", "1/6"],
        correctChoice: 1, // 2/3 is the correct answer (index 1)
        wrongAnswerText:
          "Not quite. When adding fractions with the same denominator, you just add the numerators. So 1/3 + 1/3 = 2/3.",
      },
      {
        speaker: "Squeaks",
        text: "Correct! 1/3 + 1/3 = 2/3. Since the denominators are the same, we just add the numerators.",
        background: "Addition Practice",
      },
      {
        speaker: "Squeaks",
        text: "Now try a harder one. What is 1/2 + 1/4?",
        background: "Addition Practice",
        isChoice: true,
        choices: ["2/6", "3/4", "1/6", "2/4"],
        correctChoice: 1, // 3/4 is the correct answer (index 1)
        wrongAnswerText:
          "That's not right. To add 1/2 + 1/4, we need a common denominator. Convert 1/2 to 2/4, then add: 2/4 + 1/4 = 3/4.",
      },
      {
        speaker: "Squeaks",
        text: "Excellent! 1/2 + 1/4 = 3/4. We convert 1/2 to 2/4, then add: 2/4 + 1/4 = 3/4.",
        background: "Addition Practice",
      },
    ],

    // Addition Game (Level 5)
    "5": [
      {
        speaker: "Narrator",
        text: "After learning about fraction addition, Whiskers is ready to assemble the Fraction Compass.",
        background: "Compass Chamber",
      },
      {
        speaker: "Squeaks",
        text: "Welcome to the Compass Chamber! Here, you'll need to add fractions correctly to restore the magical Fraction Compass.",
        background: "Compass Chamber",
      },
      {
        speaker: "Squeaks",
        text: "Each correct answer will add a piece to the compass. Complete all five pieces to activate it!",
        background: "Compass Chamber",
      },
      {
        speaker: "Squeaks",
        text: "Remember, when adding fractions with the same denominator, just add the numerators. When the denominators are different, find a common denominator first.",
        background: "Compass Chamber",
      },
      {
        speaker: "Whiskers",
        text: "I'm ready to restore the compass!",
        background: "Compass Chamber",
      },
    ],

    // Transition to Lessmore Bridge (Level 6)
    "6": [
      {
        speaker: "Squeaks",
        text: "You've got the compass, Whiskers! It'll guide you to the lost pieces of the orb, but remember—fractions aren't just about knowing... they're about doing.",
        background: "Fraction Emporium",
      },
      {
        speaker: "Whiskers",
        text: "Thanks, Squeaks. I can feel it... something important is just ahead.",
        background: "Fraction Emporium",
      },
      {
        speaker: "Squeaks",
        text: "Follow the old stone path outside town. It leads to Borrowdale. Last I heard, the bridge there was acting strange... numbers vanish right off the stones!",
        background: "Map Pointing",
      },
      {
        speaker: "Whiskers",
        text: "Then it's time to do some subtracting. Let's go!",
        background: "Leaving Emporium",
      },
      {
        speaker: "Narrator",
        text: "Whiskers follows the path until he arrives at the edge of a misty ravine. A grand, glowing bridge once stood here—but now, parts of it are missing.",
        background: "Lessmore Bridge",
      },
      {
        speaker: "Narrator",
        text: "The compass pulses and glows. Whiskers steps cautiously to the ravine's edge.",
        background: "Compass Glowing",
      },
      {
        speaker: "Whiskers",
        text: "The compass brought me here... but the bridge is broken!",
        background: "Lessmore Bridge",
      },
      {
        speaker: "Narrator",
        text: "A gentle rumble echoes as an ancient figure rises from the stone—Elder Pebble, the guardian of understanding.",
        background: "Elder Pebble Rising",
      },
      {
        speaker: "Elder Pebble",
        text: "Only those who understand taking away can rebuild what was lost. You must master the art of fraction subtraction to restore the bridge.",
        background: "Lessmore Bridge",
      },
      {
        speaker: "Narrator",
        text: "Elder Pebble conjures a glowing stone plate with 5 of 8 sections lit.",
        background: "Stone Plate",
      },
      {
        speaker: "Elder Pebble",
        text: "Start with 5 out of 8. Take away 2 of the same kind. What remains?",
        background: "Subtracting Fractions",
      },
      {
        speaker: "Elder Pebble",
        text: "Examples: 5/8 − 2/8 = 3/8, 3/4 − 1/4 = 2/4 → 1/2, 6/6 − 4/6 = 2/6 → 1/3",
        background: "Subtracting Fractions",
      },
      {
        speaker: "Whiskers",
        text: "So when the parts match, it's like taking blocks from the same pile?",
        background: "Subtracting Fractions",
      },
      {
        speaker: "Elder Pebble",
        text: "Exactly. When the pieces share a name, you simply subtract the tops. But not all fractions speak the same tongue...",
        background: "Subtracting Fractions",
      },
      {
        speaker: "Narrator",
        text: "He steps aside. Two glowing stones float between you—2/5 and 3/4.",
        background: "Floating Stones",
      },
      {
        speaker: "Elder Pebble",
        text: "When parts differ, you must make them agree. This is the art of the Least Common Denominator.",
        background: "Subtracting Fractions",
      },
      {
        speaker: "Elder Pebble",
        text: "To subtract 3/4 and 2/5, we must find a common ground. Their denominators—4 and 5—must become one.",
        background: "Subtracting Fractions",
      },
      {
        speaker: "Elder Pebble",
        text: "Find the Least Common Denominator (LCD). Multiples of 4: 4, 8, 12, 16, 20, ... Multiples of 5: 5, 10, 15, 20, ... LCD = 20",
        background: "Finding LCD",
      },
      {
        speaker: "Elder Pebble",
        text: "Convert to Equivalent Fractions: 3/4 → 15/20 (×5), 2/5 → 8/20 (×4)",
        background: "Converting Fractions",
      },
      {
        speaker: "Elder Pebble",
        text: "Subtract the Numerators: 15/20 − 8/20 = 7/20",
        background: "Subtracting Numerators",
      },
      {
        speaker: "Elder Pebble",
        text: "By reshaping the parts, you've brought them to unity. Only then can subtraction begin.",
        background: "Subtracting Fractions",
      },
      {
        speaker: "Elder Pebble",
        text: "Now, solve these subtraction problems to prove your worth and cross the bridge!",
        background: "Subtraction Challenge",
      },
      {
        speaker: "Elder Pebble",
        text: "What is 5/8 - 2/8?",
        background: "Subtraction Practice",
        isChoice: true,
        choices: ["3/8", "3/16", "7/8", "3/4"],
        correctChoice: 0, // 3/8 is the correct answer (index 0)
        wrongAnswerText:
          "That's not correct. When subtracting fractions with the same denominator, you just subtract the numerators. So 5/8 - 2/8 = 3/8.",
      },
      {
        speaker: "Elder Pebble",
        text: "Correct! 5/8 - 2/8 = 3/8. Since the denominators are the same, we just subtract the numerators.",
        background: "Subtraction Practice",
      },
      {
        speaker: "Elder Pebble",
        text: "Now try a harder one. What is 3/4 - 1/2?",
        background: "Subtraction Practice",
        isChoice: true,
        choices: ["2/4", "1/4", "2/6", "1/2"],
        correctChoice: 1, // 1/4 is the correct answer (index 1)
        wrongAnswerText:
          "Not quite. To subtract 3/4 - 1/2, we need a common denominator. Convert 1/2 to 2/4, then subtract: 3/4 - 2/4 = 1/4.",
      },
      {
        speaker: "Elder Pebble",
        text: "Excellent! 3/4 - 1/2 = 1/4. We convert 1/2 to 2/4, then subtract: 3/4 - 2/4 = 1/4.",
        background: "Subtraction Practice",
      },
    ],

    // Bridge Game (Level 7)
    "7": [
      {
        speaker: "Narrator",
        text: "After learning about fraction subtraction from Elder Pebble, Whiskers is ready to rebuild the Lessmore Bridge.",
        background: "Bridge Builder Challenge",
      },
      {
        speaker: "Elder Pebble",
        text: "To restore the bridge, you must solve five subtraction problems. Each correct answer will add a stone to the bridge.",
        background: "Bridge Builder Challenge",
      },
      {
        speaker: "Elder Pebble",
        text: "Remember, when subtracting fractions with the same denominator, simply subtract the numerators. When the denominators are different, find a common denominator first.",
        background: "Bridge Builder Challenge",
      },
      {
        speaker: "Whiskers",
        text: "I'm ready to rebuild the bridge!",
        background: "Bridge Builder Challenge",
      },
    ],

    // Fraction Forest (Level 8)
    "8": [
      {
        speaker: "Narrator",
        text: "After crossing the restored Lessmore Bridge, Whiskers follows the Fraction Compass to the Fraction Forest.",
        background: "Fraction Forest Entrance",
      },
      {
        speaker: "Whiskers",
        text: "So this is the Fraction Forest. It's said to be lush, but why is the place dull and dry?",
        background: "Fraction Forest",
      },
      {
        speaker: "Narrator",
        text: "In the mystical Fraction Forest, several magical trees stand with fraction plaques carved into their trunks. But something is wrong—their growth has been stunted because they're out of order.",
        background: "Fraction Forest",
      },
      {
        speaker: "Narrator",
        text: "A gentle rustling sound comes from the largest tree. Its bark shifts and forms a face—Elder Barkroot, the tree spirit guardian.",
        background: "Elder Barkroot",
      },
      {
        speaker: "Elder Barkroot",
        text: "The forest breathes in fractions. When their order is disturbed, so is the grove. You must line up the Trees of Fraction from the smallest to the largest, and balance shall return.",
        background: "Elder Barkroot",
      },
      {
        speaker: "Whiskers",
        text: "I need to arrange the fractions in order? I can do that!",
        background: "Fraction Forest",
      },
      {
        speaker: "Elder Barkroot",
        text: "To compare fractions, you must find a common denominator. Then, compare the numerators to determine which fraction is larger.",
        background: "Comparing Fractions",
      },
      {
        speaker: "Elder Barkroot",
        text: "For example, to compare 2/3 and 3/4, find the LCD: 12. Convert 2/3 to 8/12 and 3/4 to 9/12. Since 9 > 8, we know that 3/4 > 2/3.",
        background: "Comparing Fractions",
      },
      {
        speaker: "Whiskers",
        text: "I understand. Let me try to arrange these fraction trees!",
        background: "Fraction Forest",
      },
    ],

    // Realm of Balance (Level 9)
    "9": [
      {
        speaker: "Narrator",
        text: "Whiskers arrives at a floating platform. In the center is the Scale of Judgment, a massive golden balance beam. On either side, floating pedestals hold two glowing fractions.",
        background: "Realm of Balance",
      },
      {
        speaker: "Narrator",
        text: "Above the scale hover shimmering runes: >, <, =. A spectral voice echoes — the Guardian of Equilibrium.",
        background: "Scale of Judgment",
      },
      {
        speaker: "Guardian of Equilibrium",
        text: "To pass through the Realm of Balance, you must decide... Which fraction weighs more? Which weighs less? Or do they match?",
        background: "Guardian of Equilibrium",
      },
      {
        speaker: "Whiskers",
        text: "I need to compare fractions and choose the correct symbol? I can do that!",
        background: "Realm of Balance",
      },
    ],

    // Dreadpoint Hollow (Level 10)
    "10": [
      {
        speaker: "Narrator",
        text: "Whiskers approaches a ruined stone gate, the entrance to Dreadpoint Hollow.",
        background: "Dreadpoint Hollow Entrance",
      },
      {
        speaker: "Whiskers",
        text: "This is it... the end of the path. I've crossed swamps, forests, and shadows. And now, Decimal Phantom—I'm here to fix what you've broken.",
        background: "Dreadpoint Hollow Entrance",
      },
      {
        speaker: "Narrator",
        text: "A gust of wind. The Decimal Phantom appears, cloaked in mist and floating.",
        background: "Decimal Phantom Appears",
      },
      {
        speaker: "Decimal Phantom",
        text: "Foolish feline... You've scratched at the surface of fractions, but this is the realm of broken logic. Only one with mastery can balance the chaos here.",
        background: "Decimal Phantom",
      },
      {
        speaker: "Whiskers",
        text: "Then let's see how strong your chaos really is!",
        background: "Dreadpoint Hollow",
      },
      {
        speaker: "Decimal Phantom",
        text: "Let's twist your mind with forms—mixed or improper, you decide.",
        background: "Conversion Challenge",
      },
    ],

    // Epilogue (Level 11) - Victory and Credits
    "11": [
      {
        speaker: "Narrator",
        text: "And so, with courage in his paws and fractions in his heart, Whiskers the Brave stood atop the cliffs of Dreadpoint Hollow.",
        background: "Victory Scene",
      },
      {
        speaker: "Narrator",
        text: "Above him, the restored Fraction Orb pulsed with radiant energy — no longer shattered, but whole once more.",
        background: "Restored Orb",
      },
      {
        speaker: "Narrator",
        text: "As its light spread across the land, Numeria began to heal. The trees of Fraction Forest straightened their branches.",
        background: "Healing Land",
      },
      {
        speaker: "Narrator",
        text: "The scales of the Realm of Balance shimmered with harmony. Even the once-shadowed paths of Dreadpoint Hollow grew warm with morning light.",
        background: "Restored Kingdom",
      },
      {
        speaker: "King Equalis",
        text: "You've done more than defeat the Decimal Phantom, young Whiskers. You've restored knowledge, courage, and clarity to all corners of our world.",
        background: "King's Gratitude",
      },
      {
        speaker: "Whiskers",
        text: "Fractions helped me see the world in parts... but they also taught me how everything fits together.",
        background: "Wise Whiskers",
      },
      {
        speaker: "Narrator",
        text: "A grand festival is held with lanterns shaped like fractions floating into the night sky, and Whiskers is crowned Guardian of the Fraction Orb.",
        background: "Celebration",
      },
      {
        speaker: "Narrator",
        text: "When the world falls out of balance... remember: even the smallest piece has a place in the whole.",
        background: "Final Message",
      },
    ],
  }

  return levelDialogues[levelId] || defaultDialogue
}

// Add this mapping for backgrounds to image paths
export const backgroundImages: Record<string, string> = {
  'Squeaks Emporium': '/game backgrounds/Squeaks Emporium.png',
  'CheeseCrate': '/game backgrounds/CheeseCrate.png',
  'Sorting Table': '/game backgrounds/Sorting Table.png',
  'Backrooms': '/game backgrounds/Backrooms.png',
  'Broken LessMoore Bridge': '/game backgrounds/Broken LessMoore Bridge.png',
  'Fixed LessMoore Bridge': '/game backgrounds/Fixed LessMoore Bridge.png',
  'LessMoore Bridge': '/game backgrounds/LessMoore Bridge.png',
  'Fraction Forest Entrance': '/game backgrounds/Fraction Forest Entrance.png',
  'Fraction Forest': '/game backgrounds/Fraction Forest.png',
  'Realm of Balance': '/game backgrounds/Realm of Balance.png',
  'Dreadpoint Hollow Entrance': '/game backgrounds/Dreadpoint Hollow Entrance.png',
  // Add other mappings as needed
};
