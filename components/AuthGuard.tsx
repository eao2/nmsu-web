"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      if (pathname !== "/signin") {
        router.replace("/signin");
      }
      return;
    }

    if (session && !session.user.profileComplete) {
      if (pathname !== "/profile-setup") {
        router.replace("/profile-setup");
      }
    }
  }, [session, status, pathname, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
