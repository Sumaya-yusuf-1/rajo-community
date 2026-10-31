"use client";

import { Activity } from "@/components/features/activities/EventCard";
import { browserDb } from "@/lib/supabase/browser";

import { useEffect, useState } from "react";

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchActivities() {
      const supabase = browserDb();

      const { data, error } = await supabase
        .from("activities")
        .select(
          "id, title_sv, title_so, description_sv, description_so, starts_at, location, image_url",
        )
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });

      if (!active) return;

      if (error) {
        setError(error.message);
      } else {
        setActivities(data ?? []);
      }

      setLoading(false);
    }

    void fetchActivities();

    return () => {
      active = false;
    };
  }, []);

  return { activities, loading, error };
}
