import { type FC } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Avatar, Badge, Card, StatusDot, Toggle } from "~/components/core";
import { Header, PageShimmer } from "~/components/layouts";
import { PrimaryButton } from "~/components/buttons";
import { SettingsCard } from "~/components/forms/settings";
import {
  PasswordForm,
  ProfileForm,
  type PasswordFormValues,
  type ProfileFormValues,
} from "~/components/forms/profile";
import { useChangePassword, useSetStatus, useUpdatePreferences, useUpdateProfile } from "~/hooks/data";
import { useTheme } from "~/hooks/ui/use-theme";
import { toast } from "~/hooks/ui/use-toast";
import { applyFormErrors, getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { useCurrentUser } from "~/utils/with-roles";
import type { AgentStatus, CurrentUser, UserPreferences } from "~/utils/types";

export function meta() {
  return [{ title: "Profile — Asotie" }];
}

const url = Yup.string().trim().url("Enter a full URL");

const PersonalInfo: FC<{ user: CurrentUser }> = ({ user }) => {
  const { updateProfile } = useUpdateProfile();
  const form = useFormik<ProfileFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: user.name,
      jobTitle: user.jobTitle ?? "",
      phone: user.phone ?? "",
      avatarUrl: user.avatarUrl ?? "",
    },
    validationSchema: Yup.object({ name: Yup.string().trim().required("Name is required"), avatarUrl: url }),
    onSubmit: async (values, helpers) => {
      try {
        await updateProfile({
          name: values.name.trim(),
          jobTitle: values.jobTitle.trim() || null,
          phone: values.phone.trim() || null,
          avatarUrl: values.avatarUrl.trim(),
        });
        toast.success("Profile updated");
      } catch (err) {
        const message = applyFormErrors(err, helpers);
        if (message) toast.error(message);
      }
    },
  });
  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <SettingsCard
        title="Personal information"
        footer={
          <PrimaryButton type="submit" loading={form.isSubmitting} disabled={!form.dirty}>
            Save changes
          </PrimaryButton>
        }
      >
        <ProfileForm form={form} />
      </SettingsCard>
    </form>
  );
};

const STATUSES: { value: AgentStatus; label: string; help: string }[] = [
  { value: "online", label: "Online", help: "Available — receives auto-assigned conversations" },
  { value: "away", label: "Away", help: "Briefly unavailable" },
  { value: "busy", label: "Busy", help: "Working, but not taking new conversations" },
  { value: "offline", label: "Offline", help: "Not working" },
];

const Availability: FC<{ user: CurrentUser }> = ({ user }) => {
  const { setStatus, loading } = useSetStatus();
  const change = async (status: AgentStatus) => {
    try {
      await setStatus(status);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  return (
    <SettingsCard title="Availability" description="Teammates see this next to your name.">
      <div className="grid gap-2 sm:grid-cols-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={loading}
            onClick={() => void change(s.value)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 text-left transition",
              user.status === s.value
                ? "border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-500/10"
                : "border-line hover:border-line-strong",
            )}
          >
            <StatusDot status={s.value} className="mt-1" />
            <span>
              <span className="block text-sm font-medium text-ink">{s.label}</span>
              <span className="block text-xs text-ink-muted">{s.help}</span>
            </span>
          </button>
        ))}
      </div>
    </SettingsCard>
  );
};

const PREFS: { key: keyof UserPreferences; label: string; help: string }[] = [
  { key: "emailOnAssignment", label: "Email me when a conversation is assigned to me", help: "Not sent when you take it yourself." },
  { key: "emailOnNewConversation", label: "Email me about every new conversation", help: "In apps you work (all apps for admins and supervisors)." },
  { key: "desktopNotifications", label: "Desktop notifications", help: "While the dashboard is open." },
  { key: "soundEnabled", label: "Play a sound for new messages", help: "New conversations, assignments, and customer replies in your conversations." },
  { key: "dailyDigest", label: "Daily summary email", help: "Every morning at 08:00 UTC: yesterday's volume and your open queue." },
];

const Notifications: FC<{ user: CurrentUser }> = ({ user }) => {
  const { updatePreferences } = useUpdatePreferences();
  const prefs = user.preferences;
  const toggle = async (key: keyof UserPreferences, value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
      if (key === "desktopNotifications" && value && typeof Notification !== "undefined" && Notification.permission === "default") {
        void Notification.requestPermission();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  return (
    <SettingsCard title="Notifications" description="Saved as soon as you change them.">
      <div className="space-y-5">
        {PREFS.map((p) => (
          <div key={p.key}>
            <Toggle
              id={`pref-${p.key}`}
              label={p.label}
              checked={Boolean(prefs?.[p.key])}
              onChange={(v) => void toggle(p.key, v)}
            />
            {p.help && <p className="ml-14 mt-1 text-xs text-ink-muted">{p.help}</p>}
          </div>
        ))}
      </div>
    </SettingsCard>
  );
};

const Appearance: FC = () => {
  const { theme, setTheme } = useTheme();
  const { updatePreferences } = useUpdatePreferences();
  const choose = (next: "light" | "dark") => {
    setTheme(next);
    void updatePreferences({ theme: next }).catch(() => undefined);
  };
  return (
    <SettingsCard title="Appearance">
      <div className="flex gap-2">
        {(["light", "dark"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => choose(t)}
            className={cn(
              "rounded-md border px-4 py-2 text-sm font-medium capitalize transition",
              theme === t
                ? "border-primary-600 bg-primary-50 text-primary-800 dark:border-primary-400 dark:bg-primary-500/10 dark:text-white"
                : "border-line text-ink-soft hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </SettingsCard>
  );
};

const ChangePassword: FC = () => {
  const { changePassword } = useChangePassword();
  const form = useFormik<PasswordFormValues>({
    initialValues: { currentPassword: "", newPassword: "", confirm: "" },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Enter your current password"),
      newPassword: Yup.string().min(8, "At least 8 characters").required("Enter a new password"),
      confirm: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords don't match")
        .required("Confirm the new password"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
        toast.success("Password changed");
        helpers.resetForm();
      } catch (err) {
        const message = applyFormErrors(err, helpers);
        if (message) toast.error(message);
      }
    },
  });
  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <SettingsCard
        title="Password"
        footer={
          <PrimaryButton type="submit" loading={form.isSubmitting}>
            Change password
          </PrimaryButton>
        }
      >
        <PasswordForm form={form} />
      </SettingsCard>
    </form>
  );
};

const ProfilePage: FC = () => {
  const user = useCurrentUser();
  if (!user) return <PageShimmer />;
  return (
    <div className="space-y-6">
      <Header title="Profile" description="Your personal details and preferences" />
      <Card className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <div className="relative">
          <Avatar name={user.name} src={user.avatarUrl} size="xl" />
          <StatusDot status={user.status} className="absolute bottom-0 right-0 h-3.5 w-3.5 ring-2 ring-surface" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-medium text-ink">{user.name}</p>
          <p className="truncate text-sm text-ink-soft">{user.email}</p>
        </div>
        <Badge status={user.role} />
      </Card>
      <PersonalInfo user={user} />
      <Availability user={user} />
      <Notifications user={user} />
      <Appearance />
      <ChangePassword />
    </div>
  );
};

export default ProfilePage;
