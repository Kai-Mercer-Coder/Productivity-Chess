"use client";

import { useCallback, useState } from "react";
import { signOutWithCleanup } from "@/lib/signOutWithCleanup";

export function useSignOut(opts: {
  user?: { email?: string | null } | null;
  callbackUrl?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isGuest = !!opts.user?.email?.endsWith("@guest.local");

  const requestSignOut = useCallback(() => {
    if (isGuest) {
      setConfirmOpen(true);
    } else {
      void signOutWithCleanup(opts);
    }
  }, [isGuest, opts]);

  const confirmSignOut = useCallback(async () => {
    setConfirmOpen(false);
    await signOutWithCleanup(opts);
  }, [opts]);

  const cancelSignOut = useCallback(() => setConfirmOpen(false), []);

  return { isGuest, confirmOpen, requestSignOut, confirmSignOut, cancelSignOut };
}
