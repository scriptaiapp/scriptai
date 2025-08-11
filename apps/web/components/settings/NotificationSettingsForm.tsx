"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface NotificationSettingsFormProps {
    emailNotifications: boolean;
    setEmailNotifications: (checked: boolean) => void;
    scriptCompletionNotifications: boolean;
    setScriptCompletionNotifications: (checked: boolean) => void;
    marketingEmails: boolean;
    setMarketingEmails: (checked: boolean) => void;
    loading: boolean;
}

export function NotificationSettingsForm({
    emailNotifications,
    setEmailNotifications,
    scriptCompletionNotifications,
    setScriptCompletionNotifications,
    marketingEmails,
    setMarketingEmails,
    loading,
}: NotificationSettingsFormProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                </div>
                <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    disabled={loading}
                />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label htmlFor="script-completion">Script Completion</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Get notified when your scripts are generated
                    </p>
                </div>
                <Switch
                    id="script-completion"
                    checked={scriptCompletionNotifications}
                    onCheckedChange={setScriptCompletionNotifications}
                    disabled={loading}
                />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Receive updates about new features and promotions
                    </p>
                </div>
                <Switch
                    id="marketing-emails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    disabled={loading}
                />
            </div>
        </div>
    )
}
