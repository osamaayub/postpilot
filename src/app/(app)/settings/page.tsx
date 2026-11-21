import type { Metadata } from "next";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { getCurrentUser } from "@/features/auth/server/current-user";

export const metadata: Metadata = { title: "Profile" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Profile</h1>
        <p className="mt-2 text-muted">How you appear in previews, and the defaults PostPilot starts with.</p>
      </div>
      <ProfileForm profile={{ name: user.name, email: user.email, headline: user.headline, defaultTone: user.defaultTone, defaultLength: user.defaultLength }} />
    </>
  );
}
