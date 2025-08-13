"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
        <div className="space-y-6 p-6 rounded-xl border border-border bg-background shadow-sm">
            {/* --- Full Name --- */}
            <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="max-w-sm"
                />
                {nameError && (
                    <p className="text-xs text-red-500">{nameError}</p>
                )}
            </div>

            {/* --- Email Address --- */}
            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="max-w-sm cursor-not-allowed bg-muted"
                />
            </div>

            {/* --- Language --- */}
            <div className="space-y-1.5">
                <Label htmlFor="languageSelector" className="text-sm font-medium">Language</Label>
                <Select
                    value={language}
                    onValueChange={setLanguage}
                    disabled={loading}
                >
                    <SelectTrigger id="languageSelector" className="max-w-sm">
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

            <div className="border-t border-border pt-4 space-y-3">
                <Label className="text-sm font-medium">Security</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="gap-2"
                    >
                        <Shield className="h-4 w-4" />
                        Change Password
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        We’ll send you an email with password reset instructions.
                    </p>
                </div>
            </div>
        </div>
    );
}
