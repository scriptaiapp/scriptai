"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { SupabaseClient, User } from "@supabase/supabase-js";

// Define props for this component
interface ProfilePaneProps {
  user: User;
  supabase: SupabaseClient;
}

// Language data can be defined here or imported
const supportedLanguages = [
  { code: "ar", name: "العربية (Arabic)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "zh", name: "中文 (Chinese)" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français (French)" },
  { code: "de", name: "Deutsch (German)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "it", name: "Italiano (Italian)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "pt", name: "Português (Portuguese)" },
  { code: "ru", name: "Русский (Russian)" },
  { code: "es", name: "Español (Spanish)" },
];

export function ProfilePane({ user, supabase }: ProfilePaneProps) {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // State for the form is now encapsulated here
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setProfileLoading(true);
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (error) throw error;
        if (data) {
          setName(data.full_name || "");
          setLanguage(data.language || "en");
        }
      } catch (error: any) {
        toast.error("Error fetching profile", { description: error.message });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [supabase, user.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!name || name.length < 3) {
      setNameError("Name must be at least 3 characters long");
      return;
    }
    setNameError("");
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: name, language, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated successfully.");
    } catch (error: any) {
      toast.error("Error updating profile", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-border/40">
      <form onSubmit={handleUpdateProfile}>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email || ""} disabled={true} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="languageSelector">Language</Label>
            <Select value={language} onValueChange={setLanguage} disabled={loading}>
              <SelectTrigger id="languageSelector"><SelectValue /></SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/40 px-6 py-4">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}