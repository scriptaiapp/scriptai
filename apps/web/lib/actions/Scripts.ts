"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server" // Server-side Supabase client

interface Script {
    id: string;
    title: string;
    created_at: string;
    tone: string;
    language: string;
    user_id: string;
}

export async function getScripts(): Promise<Script[]> {
        const supabase = await createClient();
    try {

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Authentication error:", userError?.message);
            return [];
        }

        const { data, error } = await supabase
            .from('scripts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error("Database error:", error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("An unexpected error occurred in getScripts:", error);
        return [];
    }
}


export async function deleteScript(id: string) {
    try {
        const supabase =await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error("You must be logged in to delete a script.");
        }

        const { error } = await supabase
            .from('scripts')
            .delete()
            .match({ id: id, user_id: user.id });

        if (error) {
            throw new Error(error.message);
        }
        revalidatePath('/dashboard/scripts');

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete script:", error.message);
        return { success: false, error: "Could not delete the script. Please try again." };
    }
}

interface UpdateScriptData {
    title: string;
    content: string;
}

export async function updateScript(
    id: string,
    data: UpdateScriptData
): Promise<{ success: boolean; error?: string }> {
    if (!id || typeof id !== 'string') {
        return { success: false, error: "Invalid script ID" }
    }

    if (!data.title || !data.content) {
        return { success: false, error: "Title and content are required" }
    }

    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return { success: false, error: "Authentication required" }
        }

        // Update the script
        const { error } = await supabase
            .from("scripts")
            .update({
                title: data.title,
                content: data.content,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) {
            throw error
        }

        // Revalidate the scripts page cache
        revalidatePath('/dashboard/scripts')

        return { success: true }
    } catch (error: any) {
        console.error("Failed to update script:", error)
        return {
            success: false,
            error: error.message || "Could not update the script. Please try again."
        }
    }
}