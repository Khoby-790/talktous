import { type FC } from "react";
import type { FormikProps } from "formik";
import { TextInput } from "~/components/core";

export type ProfileFormValues = { name: string; jobTitle: string; phone: string; avatarUrl: string };

export const ProfileForm: FC<{ form: FormikProps<ProfileFormValues> }> = ({ form }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <TextInput id="name" label="Full name" autoComplete="name" {...form} />
    <TextInput id="jobTitle" label="Job title" placeholder="Support Agent" {...form} />
    <TextInput id="phone" label="Phone" type="tel" autoComplete="tel" {...form} />
    <TextInput id="avatarUrl" label="Avatar URL" placeholder="https://…" hint="Square image works best." {...form} />
  </div>
);

export type PasswordFormValues = { currentPassword: string; newPassword: string; confirm: string };

export const PasswordForm: FC<{ form: FormikProps<PasswordFormValues> }> = ({ form }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <TextInput id="currentPassword" label="Current password" type="password" autoComplete="current-password" {...form} />
    <TextInput id="newPassword" label="New password" type="password" autoComplete="new-password" {...form} />
    <TextInput id="confirm" label="Confirm new password" type="password" autoComplete="new-password" {...form} />
  </div>
);
