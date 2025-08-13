"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface NotificationSettingsFormProps {
    emailNotifications: boolean
    setEmailNotifications: (checked: boolean) => void
    scriptCompletionNotifications: boolean
    setScriptCompletionNotifications: (checked: boolean) => void
    marketingEmails: boolean
    setMarketingEmails: (checked: boolean) => void
    loading: boolean
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
    const items = [
        {
            id: "email-notifications",
            label: "Email Notifications",
            description: "Receive notifications via email",
            checked: emailNotifications,
            onChange: setEmailNotifications,
        },
        {
            id: "script-completion",
            label: "Script Completion",
            description: "Get notified when your scripts are generated",
            checked: scriptCompletionNotifications,
            onChange: setScriptCompletionNotifications,
        },
        {
            id: "marketing-emails",
            label: "Marketing Emails",
            description: "Receive updates about new features and promotions",
            checked: marketingEmails,
            onChange: setMarketingEmails,
        },
    ]

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                    <div className="space-y-1">
                        <Label
                            htmlFor={item.id}
                            className="text-base font-medium text-slate-900 dark:text-slate-100"
                        >
                            {item.label}
                        </Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {item.description}
                        </p>
                    </div>
                    <Switch
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={item.onChange}
                        disabled={loading}
                    />
                </div>
            ))}
        </div>
    )
}
