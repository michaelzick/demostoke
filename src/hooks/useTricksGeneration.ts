import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Trick {
  name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  youtubeSearchQuery: string;
}

interface UseTricksGenerationProps {
  category: string;
  subcategory?: string;
  name: string;
  specifications?: Record<string, string>;
}

export function useTricksGeneration() {
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTricks = async ({ category, subcategory, name, specifications }: UseTricksGenerationProps) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-tricks", {
        body: { category, subcategory, name, specifications },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.tricks) {
        setTricks(data.tricks);
        return data.tricks;
      } else {
        throw new Error("No tricks returned from API");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate tricks";
      setError(message);
      console.error("useTricksGeneration error:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setTricks([]);
    setError(null);
  };

  return {
    tricks,
    setTricks,
    isLoading,
    error,
    generateTricks,
    reset,
  };
}
