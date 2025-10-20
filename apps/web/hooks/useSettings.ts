// hooks/useSettingsApi.ts
"use client";

import { useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { toast } from "sonner";

interface BillingDetails {
  current_period_end: string;
  plan_id: string;
}

export function useSettings
() {
  const { supabase, user } = useSupabase();

  // --- Loading states ---
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)

  // --- Profile update ---
  const updateProfile = async ({
    name,
    language,
    avatar,
    initialAvatar
  }: {
    name: string;
    language: string;
    avatar?: File | null;
    initialAvatar: string | null;
  }) => {
   if (!user) return;
    if (!name || name.length < 3) {
      toast.error("Name must be at least 3 characters long");
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const updates: {
        full_name: string;
        language: string;
        updated_at: string;
        avatar_url?: string | null;
      } = {
        full_name: name,
        language,
        updated_at: new Date().toISOString(),
      };



      if (avatar) {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(avatar.type)) {
          toast.error("Invalid file type. Please upload JPG, PNG, GIF, or WEBP.");
          return false;
        }

        const formData = new FormData();
        formData.append('file', avatar);

        const response = await fetch('/api/uploads/avatar', {
          method: 'POST',
          body: formData, // no manual Content-Type
        });

        const result = await response.json();
        console.log(result.url);


        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || 'Failed to upload.');
        }
        updates.avatar_url = result.url;
      } else if (!initialAvatar && !avatar) {
        // Call the DELETE method of API route
        await fetch('/api/uploads/avatar', {
          method: 'DELETE',
        });
        updates.avatar_url = null;
      }

      // console.log(updates)

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated", { description: "Your profile has been updated successfully." });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile", { description: error.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // --- Notification update ---
  const updateNotifications = async ({
    email,
    scriptCompletion,
    marketing,
  }: {
    email: boolean;
    scriptCompletion: boolean;
    marketing: boolean;
  }) => {
    setLoadingNotifications(true);
    try {
      // Example API simulation
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Notification preferences updated");
    } catch (error: any) {
      toast.error("Error updating notifications", { description: error.message });
    } finally {
      setLoadingNotifications(false);
    }
  };

  // --- Billing update ---
  const updateBilling = async ({
    plan,
    paymentMethod,
  }: {
    plan: string;
    paymentMethod: string;
  }) => {
    setLoadingBilling(true);
    try {
      // Example API simulation
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Billing info updated");
    } catch (error: any) {
      toast.error("Error updating billing", { description: error.message });
    } finally {
      setLoadingBilling(false);
    }
  };

  const fetchSubscriptionDetails = async (userId:string): Promise<void> => {
    setLoadingBilling(true)
     try {
      const { data: existing } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

      if(existing) {
        setBillingDetails(existing as BillingDetails)
      }
     } catch (error) {
      
     } finally {
      setLoadingBilling(false)
     }
  } 

  // --- Password reset ---
  const changePassword = async () => {
    if (!user?.email) return;
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error("Error sending password reset email", {
        description: error.message,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    // Profile
    updateProfile,
    isUpdatingProfile, // Renamed and specific
  isChangingPassword,
    changePassword,

    // Notifications
    updateNotifications,
    loadingNotifications,

    // Billing
    updateBilling,
    loadingBilling,
    fetchSubscriptionDetails,
    billingDetails,
  };
}
