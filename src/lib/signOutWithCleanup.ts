"use client";

import { signOut } from "next-auth/react";
import { clearGuestData } from "@/lib/clearGuestData";

export async function signOutWithCleanup(opts: {
  user?: { email?: string | null } | null;
  callbackUrl?: string;
} = {}) {
  if (opts.user?.email?.endsWith("@guest.local")) {
    await clearGuestData(opts.user.email);
  }
  await signOut({ callbackUrl: opts.callbackUrl ?? "/login" });
}
