
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/hooks/useSettings"
import { Bell, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"


interface SettingsState {
    email: boolean
    scriptCompletion: boolean
    marketing: boolean
}

export function NotificationSettingsForm() {
    const { updateNotifications, loadingNotifications } = useSettings()

    const [isLoadingData, setIsLoadingData] = useState(true)
    const [settings, setSettings] = useState<SettingsState>({
        email: true,
        scriptCompletion: true,
        marketing: false,
    })

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoadingData(true)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setSettings({
                email: true,
                scriptCompletion: true,
                marketing: false,
            })
            setIsLoadingData(false)
        }

        fetchSettings()
    }, [])


    const handleSettingChange = (key: keyof SettingsState, value: boolean) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }))
    }


    const handleSave = () => {
        updateNotifications(settings)
    }

    const items = [
        {
            id: "email-notifications",
            label: "Email Notifications",
            description: "Receive general notifications via email.",
            checked: settings.email,
            onChange: (checked: boolean) => handleSettingChange("email", checked),
        },
        {
            id: "script-completion",
            label: "Script Completion",
            description: "Get notified when your scripts finish generating.",
            checked: settings.scriptCompletion,
            onChange: (checked: boolean) => handleSettingChange("scriptCompletion", checked),
        },
        {
            id: "marketing-emails",
            label: "Marketing Emails",
            description: "Receive updates about new features and promotions.",
            checked: settings.marketing,
            onChange: (checked: boolean) => handleSettingChange("marketing", checked),
        },
    ]

    return (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4"
                    >
                        <div className="space-y-1">
                            <Label htmlFor={item.id} className="text-base font-medium">
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

                            disabled={isLoadingData || loadingNotifications}
                        />
                    </div>
                ))}
            </CardContent>
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 rounded-b-lg">
                <Button onClick={handleSave} disabled={loadingNotifications}>
                    {loadingNotifications ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Bell className="mr-2 h-4 w-4" />
                    )}
                    Save Preferences
                </Button>
            </div>
        </Card>
    )
}