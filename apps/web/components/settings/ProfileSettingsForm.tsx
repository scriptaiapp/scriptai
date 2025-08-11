"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Shield } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define the shape of the props this component expects
interface ProfileSettingsFormProps {
    name: string;
    setName: (name: string) => void;
    email: string;
    language: string;
    setLanguage: (language: string) => void;
    nameError: string;
    loading: boolean;
    handleChangePassword: () => void;
    supportedLanguages: { code: string; name: string }[];
}

export function ProfileSettingsForm({
    name,
    setName,
    email,
    language,
    setLanguage,
    nameError,
    loading,
    handleChangePassword,
    supportedLanguages,
}: ProfileSettingsFormProps) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                {nameError && <p className="text-red-500 text-xs">{nameError}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled={true}
                    className="bg-slate-50 dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Your email cannot be changed</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="languageSelector">Language</Label>
                <Select
                    value={language}
                    onValueChange={setLanguage}
                    disabled={loading}
                >
                    <SelectTrigger id="languageSelector">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        {supportedLanguages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security settings</p>
                <Button variant="outline" onClick={handleChangePassword} disabled={loading} className="mt-2">
                    <Shield className="mr-2 h-4 w-4" />
                    Change Password
                </Button>
            </div>
        </>
    )
}
