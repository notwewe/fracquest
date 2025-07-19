"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ClientGameBoundary from "./ClientGameBoundary";

interface PlayLevelClientProps {
  id: string;
}

export default function PlayLevelClient({ id }: PlayLevelClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      // Get the waypoint data
      const { data: waypoint } = await supabase.from("waypoints").select("*").eq("id", id).single();
      if (!waypoint) {
        router.replace("/student/game");
        return;
      }
      // Allow access to any level (for revisiting completed levels)
      const { data: progress } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", user.id)
        .eq("waypoint_id", Number(id))
        .maybeSingle();
      // Check if this is the first level (always accessible) or if user has progress OR completed previous levels
      const isFirstLevel = Number(id) === 1;
      // Check if user has completed previous levels (for sequential access)
      const { data: previousProgress } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", user.id)
        .lt("waypoint_id", Number(id))
        .order("waypoint_id", { ascending: false })
        .limit(1)
        .maybeSingle();
      const access = isFirstLevel || progress !== null || previousProgress !== null;
      setHasAccess(access);
      setLoading(false);
      if (!access) {
        router.replace("/student/game");
      }
    };
    checkAccess();
  }, [id, router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!hasAccess) return null;
  return <ClientGameBoundary id={Number(id)} />;
} 