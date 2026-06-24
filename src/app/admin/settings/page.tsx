"use client";

import { Icon } from "@iconify/react";
import { PageIntro } from "@/components/admin/page-intro";
import { WidgetCard } from "@/components/admin/widget-card";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

function ProfileTab() {
  return (
    <WidgetCard title="Profile Information" icon="material-symbols:person-rounded">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <div className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-[#5450d8] to-[#7a76e3] font-heading text-[36px] font-semibold text-white">
            M
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="gap-2">
              <Icon icon="material-symbols:upload-rounded" width={18} height={18} />
              Change avatar
            </Button>
            <p className="font-body text-[14px] text-[#868686]">
              JPG or PNG, max 2MB
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" defaultValue="Musfiq" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" defaultValue="Rahman" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="musfiq@mba.ai" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" defaultValue="Admin" disabled />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} placeholder="Tell us about yourself" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </div>
    </WidgetCard>
  );
}

function PasswordTab() {
  return (
    <WidgetCard title="Change Password" icon="material-symbols:lock-rounded">
      <div className="flex max-w-xl flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" type="password" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new">New password</Label>
          <Input id="new" type="password" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" type="password" />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Update password</Button>
        </div>
      </div>
    </WidgetCard>
  );
}

function NotificationsTab() {
  const PREFS = [
    { key: "newUser",   title: "New user signups",        detail: "Get notified when a new user registers" },
    { key: "payments",  title: "Payment events",          detail: "Successful payments and failed attempts" },
    { key: "ai",        title: "AI cost alerts",          detail: "When daily/weekly AI cost exceeds threshold" },
    { key: "weekly",    title: "Weekly platform digest",  detail: "Summary of activity across the platform" },
  ];

  return (
    <WidgetCard
      title="Notification Preferences"
      icon="famicons:notifications"
    >
      <div className="flex flex-col gap-1">
        {PREFS.map((p, i) => (
          <div key={p.key} className="flex flex-col">
            <div className="flex items-center justify-between py-4">
              <div className="flex flex-col">
                <p className="font-heading text-[16px] font-semibold text-[#272727]">
                  {p.title}
                </p>
                <p className="font-body text-[14px] text-[#868686]">
                  {p.detail}
                </p>
              </div>
              <Switch defaultChecked={i < 2} />
            </div>
            {i < PREFS.length - 1 && (
              <div className="h-px w-full bg-[#f0f0f5]" />
            )}
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro title="Settings" description="Manage your account and preferences" />

      <AdminTabs
        tabs={[
          { value: "profile", label: "Profile", content: <ProfileTab /> },
          { value: "password", label: "Password", content: <PasswordTab /> },
          { value: "notifications", label: "Notifications", content: <NotificationsTab /> },
        ]}
      />
    </div>
  );
}
