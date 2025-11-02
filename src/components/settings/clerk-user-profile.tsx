// src/components/settings/clerk-user-profile.tsx
"use client";

import { UserProfile } from "@clerk/nextjs";

export function ClerkUserProfile() {
  return (
    <UserProfile 
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none border-0",
          navbar: "hidden",
          pageScrollBox: "p-0",
          page: "bg-transparent",
        }
      }}
    />
  );
}