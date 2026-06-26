"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { PageIntro } from "@/components/admin/page-intro";
import { WidgetCard } from "@/components/admin/widget-card";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/auth-provider";
import { useUpdateMe, useChangePassword } from "@/services/auth.service";
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
} from "@/services/settings.service";
import type { NotificationPreferences } from "@/types/domain";

function ProfileTab() {
  const { user } = useAuth();
  const updateMe = useUpdateMe();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Sync the form once the authenticated user resolves.
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  const avatarInitial = (user?.firstName?.[0] ?? "A").toUpperCase();
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : "";

  const isDirty =
    firstName.trim() !== (user?.firstName ?? "") ||
    lastName.trim() !== (user?.lastName ?? "");

  const handleCancel = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  };

  const handleSave = () => {
    updateMe.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim() },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : "Failed to update profile",
          ),
      },
    );
  };

  return (
    <WidgetCard title="Profile Information" icon="material-symbols:person-rounded">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <div className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-[#5450d8] to-[#7a76e3] font-heading text-[36px] font-semibold text-white">
            {avatarInitial}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="gap-2" disabled>
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
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={roleLabel} disabled />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!isDirty || updateMe.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || !firstName.trim() || updateMe.isPending}
          >
            {updateMe.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
}

function PasswordTab() {
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && next !== confirm;
  const isValid =
    current.length >= 8 && next.length >= 8 && next === confirm;

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const handleUpdate = () => {
    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          reset();
        },
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update password",
          ),
      },
    );
  };

  return (
    <WidgetCard title="Change Password" icon="material-symbols:lock-rounded">
      <div className="flex max-w-xl flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current">Current password</Label>
          <Input
            id="current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new">New password</Label>
          <Input
            id="new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <p className="font-body text-[12px] text-[#868686]">
            Must be at least 8 characters.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && (
            <p className="font-body text-[12px] text-[#fc5a33]">
              Passwords do not match.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={reset}
            disabled={
              changePassword.isPending ||
              (!current && !next && !confirm)
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!isValid || changePassword.isPending}
          >
            {changePassword.isPending ? "Updating..." : "Update password"}
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
}

const NOTIFICATION_PREFS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  detail: string;
}> = [
  { key: "emailEnabled",     title: "Email notifications", detail: "Receive notifications by email" },
  { key: "pushEnabled",      title: "Push notifications",  detail: "Receive in-app push notifications" },
  { key: "sessionReminders", title: "Session reminders",   detail: "Reminders for upcoming interview sessions" },
  { key: "feedbackAlerts",   title: "Feedback alerts",     detail: "Notify when AI feedback is ready" },
  { key: "paymentAlerts",    title: "Payment alerts",      detail: "Successful payments and failed attempts" },
  { key: "marketingEmails",  title: "Marketing emails",    detail: "Product news and occasional offers" },
];

function NotificationsTab() {
  const { data: prefs, isLoading } = useNotificationPrefs();
  const updatePrefs = useUpdateNotificationPrefs();

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    const payload: Partial<NotificationPreferences> = { [key]: value };
    updatePrefs.mutate(payload, {
      onError: (error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update preferences",
        ),
    });
  };

  return (
    <WidgetCard title="Notification Preferences" icon="famicons:notifications">
      {isLoading ? (
        <p className="py-4 font-body text-[14px] text-[#868686]">
          Loading preferences…
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {NOTIFICATION_PREFS.map((p, i) => (
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
                <Switch
                  checked={prefs?.[p.key] ?? false}
                  disabled={updatePrefs.isPending}
                  onCheckedChange={(value) => handleToggle(p.key, value)}
                />
              </div>
              {i < NOTIFICATION_PREFS.length - 1 && (
                <div className="h-px w-full bg-[#f0f0f5]" />
              )}
            </div>
          ))}
        </div>
      )}
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
