import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSupabase } from "@/components/supabase-provider";

interface Script {
  id: string;
  title: string;
  created_at: string;
  tone: string;
  language: string;
}

interface ScriptsContextType {
  scripts: Script[];
  loading: boolean;
  removeScript: (id: string) => Promise<void>;
}

const ScriptsContext = createContext<ScriptsContextType | undefined>(undefined);

export function ScriptsProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabase();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchScripts = async () => {
      try {
        const response = await fetch("/api/scripts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch scripts");
        }

        const data = await response.json();
        setScripts(data || []);
      } catch (error: any) {
        toast.error("Error fetching scripts", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, [user]);

  const removeScript = async (id: string) => {
    try {
      const response = await fetch(`/api/scripts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete script");
      }

      setScripts((prev) => prev.filter((script) => script.id !== id));
    } catch (error) {
      throw error;
    }
  };

  return (
    <ScriptsContext.Provider value={{ scripts, loading, removeScript }}>
      {children}
    </ScriptsContext.Provider>
  );
}

export function useScripts() {
  const context = useContext(ScriptsContext);
  if (undefined === context) {
    throw new Error("useScripts must be used within a ScriptsProvider");
  }
  return context;
}