"use client";

import type React from "react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { type SupabaseClient, type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@repo/validation";

type SupabaseContext = {
  supabase: SupabaseClient;
  user: User | null;
  providerToken: string | null;
  setProviderToken: (token: string | null) => void;
  session: any;
  setSession: (session: any) => void;
  loading: boolean;
  profile: UserProfile | null;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
  fetchUserProfile: (userId: string) => Promise<void>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch user profile only when user is available
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("avatar_url, email, full_name, credits, ai_trained, youtube_connected, language, referral_code")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Generate referral code if user doesn't have one
      if (!profileData.referral_code) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ referral_code: generateReferralCode() })
          .eq("user_id", userId);
        
        if (!updateError) {
          // Refresh profile data
          const { data: updatedProfile } = await supabase
            .from("profiles")
            .select("avatar_url, email, full_name, credits, ai_trained, youtube_connected, language, referral_code")
            .eq("user_id", userId)
            .single();
          
          setProfile(updatedProfile as UserProfile);
          return;
        }
      }

      setProfile(profileData as UserProfile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      setProfile(null);
      return;
    }
  };

  function generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Fetch user and session
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error.message);
          return;
        }

        setUser(session?.user ?? null);
        setSession(session);
        setProviderToken(session?.provider_token ?? null);
      } catch (error) {
        console.error("Unexpected error during auth:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Use getUser() for authenticated data instead of session.user
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setUser(user);
          setSession(session);
          setProviderToken(session?.provider_token ?? null);
        }
      } else {
        setUser(null);
        setSession(null);
        setProviderToken(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setProfile(null); // Clear profile if no user
    }
  }, [user]);

  return (
    <Context.Provider
      value={{ supabase, user, profile, setProfile, session, setSession, providerToken, setProviderToken, loading, fetchUserProfile }}
    >
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};