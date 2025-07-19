"use client";
import { gameContent } from "@/lib/game-content";

export default function ClientGameBoundary({ id }: { id: number }) {
  const LevelComponent = gameContent[id as keyof typeof gameContent];
  if (!LevelComponent) return null;
  return <LevelComponent />;
} 