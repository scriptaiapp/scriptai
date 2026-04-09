"use client";

import { useState } from "react";
import { useAffiliateStatus, affiliateApi } from "@/hooks/useAffiliate";
import { useSupabase } from "@/components/supabase-provider";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, Clock, XCircle, Send } from "lucide-react";

export function AffiliateStatus() {
  const { request, loading, refresh } = useAffiliateStatus();
  const { user, profile } = useSupabase();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    website: "",
    social_media: "",
    audience_size: "",
    promotion_method: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setSubmitting(true);
      await affiliateApi.apply(form);
      toast.success("Application submitted successfully!");
      refresh();
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  if (request) {
    const statusConfig = {
      pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800", label: "Pending Review" },
      approved: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", label: "Approved" },
      denied: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", label: "Denied" },
    }[request.status];

    const StatusIcon = statusConfig.icon;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Affiliate Program
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your affiliate application status
          </p>
        </div>

        <div className={`rounded-xl border ${statusConfig.border} ${statusConfig.bg} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
            <div>
              <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submitted on {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Name:</span>
              <span className="ml-2 text-slate-900 dark:text-slate-100">{request.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Email:</span>
              <span className="ml-2 text-slate-900 dark:text-slate-100">{request.email}</span>
            </div>
            {request.website && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Website:</span>
                <span className="ml-2 text-slate-900 dark:text-slate-100">{request.website}</span>
              </div>
            )}
            {request.promotion_method && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Promotion:</span>
                <span className="ml-2 text-slate-900 dark:text-slate-100">{request.promotion_method}</span>
              </div>
            )}
          </div>

          {request.admin_notes && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Admin Notes:</p>
              <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">{request.admin_notes}</p>
            </div>
          )}

          {request.status === 'approved' && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Your application has been approved. Check your email for the affiliate signup link and further instructions.
              </p>
            </div>
          )}

          {request.status === 'denied' && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setForm({
                    full_name: profile?.full_name || "",
                    email: user?.email || "",
                    website: "",
                    social_media: "",
                    audience_size: "",
                    promotion_method: "",
                    reason: "",
                  });
                  refresh();
                }}
              >
                Apply Again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Become an Affiliate
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Join our affiliate program and earn commissions by promoting our platform.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Full Name *
              </label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder={profile?.full_name || "Your full name"}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Email *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={user?.email || "Your email"}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Website / Blog
              </label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Social Media Profiles
              </label>
              <Input
                value={form.social_media}
                onChange={(e) => setForm({ ...form, social_media: e.target.value })}
                placeholder="YouTube, Twitter, Instagram links"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Audience Size
              </label>
              <Input
                value={form.audience_size}
                onChange={(e) => setForm({ ...form, audience_size: e.target.value })}
                placeholder="e.g., 10K YouTube subscribers"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                How will you promote us?
              </label>
              <Input
                value={form.promotion_method}
                onChange={(e) => setForm({ ...form, promotion_method: e.target.value })}
                placeholder="e.g., YouTube reviews, blog posts"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Why do you want to join our affiliate program? *
            </label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Tell us about yourself and why you'd be a great affiliate partner..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={submitting} className="gap-2">
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </div>
  );
}
