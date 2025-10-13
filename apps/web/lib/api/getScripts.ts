export interface Script {
    id: string
    title: string
    content?: string
    created_at: string
    updated_at?: string
    user_id: string
}


export async function getScripts(): Promise<Script[]> {
    try {
        const res = await fetch("/api/scripts", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch scripts: ${res.statusText}`)
        }

        return await res.json()
    } catch (error) {
        console.error("Error fetching scripts:", error)
        return []
    }
}


export async function updateScript(
    id: string,
    data: Partial<Pick<Script, "title" | "content">>
): Promise<Script | null> {
    try {
        const res = await fetch(`/api/scripts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            throw new Error(`Failed to update script: ${res.statusText}`)
        }

        return await res.json()
    } catch (error) {
        console.error(`Error updating script with ID ${id}:`, error)
        return null
    }
}

export async function deleteScript(id: string): Promise<boolean> {
    try {
        const res = await fetch(`/api/scripts/${id}`, {
            method: "DELETE",
        })

        if (!res.ok) {
            throw new Error(`Failed to delete script: ${res.statusText}`)
        }

        return true
    } catch (error) {
        console.error(`Error deleting script with ID ${id}:`, error)
        return false
    }
}