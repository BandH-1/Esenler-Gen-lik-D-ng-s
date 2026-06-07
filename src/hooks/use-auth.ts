import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  neighborhood: string | null;
  school_type: string | null;
  school_name: string | null;
  verification_status: "unverified" | "pending" | "verified" | "rejected" | "suspended";
  eco_point_balance: number;
  trust_score: number;
  completed_gives: number;
  completed_receives: number;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, neighborhood, school_type, school_name, verification_status, eco_point_balance, trust_score, completed_gives, completed_receives"
        )
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}

export type { Profile, User };
