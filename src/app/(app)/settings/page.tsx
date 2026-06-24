"use client";

import { useEffect, useState } from "react";
import { User, Lock, Bell, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { useProfile, useUpdateProfile } from "@/services/profile.service";
import { useChangePassword } from "@/services/auth.service";
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
  useDeleteAccount,
} from "@/services/settings.service";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const fieldStyle: React.CSSProperties = {
  height: "48px",
  borderRadius: "10px",
  border: "1px solid #d9d9d9",
  padding: "0 14px",
  fontFamily: inter,
  fontSize: "13px",
  color: "#272727",
  background: "white",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontFamily: sora,
  fontSize: "13px",
  fontWeight: 600,
  color: "#222c44",
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const { data: notifPrefs, isLoading: notifsLoading } =
    useNotificationPrefs();
  const updateNotifPrefs = useUpdateNotificationPrefs();
  const deleteAccountMutation = useDeleteAccount();

  const [confirmDelete, setConfirmDelete] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedInUrl: "",
  });

  // Sync profile data when loaded
  useEffect(() => {
    if (profileData || user) {
      setProfile({
        fullName:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName ?? "",
        email: user?.email ?? "",
        phone: profileData?.phone ?? "",
        linkedInUrl: profileData?.linkedInUrl ?? "",
      });
    }
  }, [profileData, user]);

  // Password form state
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const passwordValid =
    passwords.current.length >= 8 &&
    passwords.next.length >= 8 &&
    passwords.next === passwords.confirm;

  // Notification toggles
  const emailNotifs = notifPrefs?.emailEnabled ?? false;
  const practiceReminders = notifPrefs?.sessionReminders ?? true;

  const handleSaveProfile = () => {
    const nameParts = profile.fullName.trim().split(/\s+/);
    updateProfile.mutate(
      {
        phone: profile.phone || undefined,
        linkedInUrl: profile.linkedInUrl || undefined,
      },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update profile",
          ),
      },
    );
  };

  const handleUpdatePassword = () => {
    changePassword.mutate(
      {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          setPasswords({ current: "", next: "", confirm: "" });
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

  const handleToggleEmailNotifs = (next: boolean) => {
    updateNotifPrefs.mutate(
      { emailEnabled: next },
      {
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update preferences",
          ),
      },
    );
  };

  const handleTogglePracticeReminders = (next: boolean) => {
    updateNotifPrefs.mutate(
      { sessionReminders: next },
      {
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update preferences",
          ),
      },
    );
  };

  const handleDelete = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmDelete(false);
        toast.success("Account deletion scheduled");
        logout();
      },
      onError: (error) => {
        setConfirmDelete(false);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete account",
        );
      },
    });
  };

  if (profileLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-20">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "#5450d8" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1
        style={{
          fontFamily: sora,
          fontSize: "28px",
          fontWeight: 700,
          color: "#222c44",
          lineHeight: 1.2,
        }}
      >
        Settings
      </h1>
      <p
        className="mt-1"
        style={{ fontFamily: inter, fontSize: "14px", color: "#9ea1c5" }}
      >
        Invest in your MBA interview success
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {/* Edit Profile */}
        <SettingsCard
          icon={<User size={18} />}
          iconBg="#22c55e"
          title="Edit Profile"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                className="focus:border-[#5450d8] focus:outline-none"
                style={fieldStyle}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={profile.email}
                disabled
                className="focus:border-[#5450d8] focus:outline-none"
                style={{ ...fieldStyle, opacity: 0.6 }}
              />
            </Field>
            <Field label="Phone">
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="focus:border-[#5450d8] focus:outline-none"
                style={fieldStyle}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                type="text"
                value={profile.linkedInUrl}
                onChange={(e) =>
                  setProfile({ ...profile, linkedInUrl: e.target.value })
                }
                className="focus:border-[#5450d8] focus:outline-none"
                style={fieldStyle}
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <SolidButton
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </SolidButton>
          </div>
        </SettingsCard>

        {/* Change Password */}
        <SettingsCard
          icon={<Lock size={18} />}
          iconBg="#eab308"
          title="Change Password"
        >
          <Field label="Current Password">
            <input
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              className="focus:border-[#5450d8] focus:outline-none"
              style={fieldStyle}
            />
          </Field>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="New Password">
              <input
                type="password"
                value={passwords.next}
                onChange={(e) =>
                  setPasswords({ ...passwords, next: e.target.value })
                }
                className="focus:border-[#5450d8] focus:outline-none"
                style={fieldStyle}
              />
            </Field>
            <Field label="Confirm Password">
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="focus:border-[#5450d8] focus:outline-none"
                style={fieldStyle}
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <SolidButton
              disabled={!passwordValid || changePassword.isPending}
              onClick={handleUpdatePassword}
            >
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </SolidButton>
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard
          icon={<Bell size={18} />}
          iconBg="#f97316"
          title="Notifications"
        >
          {notifsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2
                size={20}
                className="animate-spin"
                style={{ color: "#5450d8" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ToggleCard
                title="Email notifications"
                description="Receive feedback and score updates"
                enabled={emailNotifs}
                onChange={handleToggleEmailNotifs}
              />
              <ToggleCard
                title="Practice reminders"
                description="Daily reminders to practice"
                enabled={practiceReminders}
                onChange={handleTogglePracticeReminders}
              />
            </div>
          )}
        </SettingsCard>

        {/* Delete Account */}
        <div
          className="rounded-[16px] bg-white p-5"
          style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: "#f97316" }}
              >
                <Bell size={16} />
              </div>
              <div className="flex flex-col">
                <h3
                  style={{
                    fontFamily: sora,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#222c44",
                  }}
                >
                  Delete Account
                </h3>
                <p
                  style={{
                    fontFamily: inter,
                    fontSize: "12px",
                    color: "#9ea1c5",
                  }}
                >
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-[12px] transition-opacity hover:opacity-90"
              style={{
                background: "#f97316",
                color: "white",
                padding: "12px 22px",
                fontFamily: inter,
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent showCloseButton={false} className="sm:max-w-100">
          <div className="flex flex-col items-center px-4 py-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ background: "#f97316" }}
            >
              <Trash2 size={22} />
            </div>
            <h2
              className="mt-4 text-center"
              style={{
                fontFamily: sora,
                fontSize: "20px",
                fontWeight: 700,
                color: "#222c44",
                lineHeight: 1.3,
              }}
            >
              Are You Sure You Want to Leave?
            </h2>
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: inter,
                fontSize: "13px",
                color: "#9ea1c5",
                lineHeight: 1.5,
              }}
            >
              Deleting your account will erase all your Kira interview history,
              scores, and progress. This action cannot be undone.
            </p>

            <div className="mt-5 flex w-full gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-[12px] transition-colors"
                style={{
                  background: "#ffe9da",
                  color: "#f97316",
                  padding: "12px 0",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteAccountMutation.isPending}
                className="flex-1 rounded-[12px] transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "#f97316",
                  color: "white",
                  padding: "12px 0",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: deleteAccountMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {deleteAccountMutation.isPending
                  ? "Deleting..."
                  : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Local building blocks                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function SettingsCard({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[16px] bg-white p-6"
      style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-white"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <h2
          style={{
            fontFamily: sora,
            fontSize: "15px",
            fontWeight: 700,
            color: "#222c44",
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SolidButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-[12px] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: disabled ? "#d9d9d9" : "#5450d8",
        color: "white",
        padding: "12px 28px",
        fontFamily: inter,
        fontSize: "13px",
        fontWeight: 600,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ToggleCard({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-[12px] px-4 py-4"
      style={{ background: "#edecfd" }}
    >
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: sora,
            fontSize: "14px",
            fontWeight: 700,
            color: "#222c44",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: inter,
            fontSize: "12px",
            color: "#5b5b6b",
          }}
        >
          {description}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className="relative shrink-0 transition-colors"
        style={{
          width: "40px",
          height: "22px",
          borderRadius: "12px",
          background: enabled ? "#5450d8" : "#cdd0e8",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          className="absolute top-1 transition-all"
          style={{
            left: enabled ? "20px" : "4px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "white",
          }}
        />
      </button>
    </div>
  );
}
