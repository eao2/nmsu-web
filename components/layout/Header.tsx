"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import NotificationBell from "@/components/notifications/NotificationBell";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter()
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.replace("/signin");
  //   }
  // }, [status, router]);

  if(!session){
    return null;
  }


  return (
    <header className="bg-zinc-100 border-b border-zinc-300 sticky top-0 z-50 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/clubs" className="flex items-center gap-2 no-underline">
            <span className="w-8 h-8 flex items-center justify-center md:hidden">
              <Image
                src="/nmsu-logo-sm.svg"
                alt="NMSU Logo"
                width={32}
                height={32}
              />
            </span>
            <span className="w-52 h-8 flex items-center justify-center hidden md:block">
              <Image
                src="/nmsu-logo-lng.svg"
                alt="NMSU Logo"
                width={210}
                height={32}
              />
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-12 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors duration-200 dark:hover:bg-zinc-800 dark:bg-zinc-800 bg-muted-50"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ""}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-border dark:bg-zinc-800 dark:border-zinc-700">
                    <span className="text-foreground font-medium text-sm dark:text-zinc-100">
                      {session.user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-foreground dark:text-zinc-100">
                  {session.user.name}
                </span>
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-zinc-100 border border-zinc-300 rounded-xl py-2 z-50 dark:bg-zinc-900 dark:border-zinc-800">
                    <div className="px-4 py-2 border-b border-zinc-300 dark:border-zinc-700">
                      <p className="text-sm font-semibold text-foreground dark:text-zinc-100">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate dark:text-gray-400">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/clubs"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors duration-200 no-underline dark:text-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Клубууд
                    </Link>
                    <Link
                      href="/notifications"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors duration-200 no-underline dark:text-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Мэдэгдлүүд
                    </Link>
                    {session.user.role === "UNIVERSAL_ADMIN" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors duration-200 no-underline dark:text-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Админ хэсэг
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      className="bg-zinc-100 dark:bg-zinc-900 w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-muted/50 transition-colors duration-200 dark:hover:bg-zinc-800"
                    >
                      Гарах
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}