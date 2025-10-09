// app/clubs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ClubCard from "@/components/clubs/ClubCard";
import EventBanner from "@/components/layout/EventBanner";

export default function ClubsPage() {
  const { data: session } = useSession();
  const [myClubs, setMyClubs] = useState([]);
  const [otherClubs, setOtherClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, [session]);

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/clubs');
      const data = await response.json();
      setMyClubs(data.myClubs || []);
      setOtherClubs(data.otherClubs || []);
    } catch (error) {
      console.error("Fetch clubs error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton loader component
  const ClubCardSkeleton = () => (
    <div className="bg-card rounded-xl overflow-hidden border border-border dark:border-zinc-800">
      <div className="h-32 bg-muted/50 animate-pulse dark:bg-zinc-900/50"></div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full bg-muted/50 animate-pulse mr-3 dark:bg-zinc-900/50"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4 mb-2 dark:bg-zinc-900/50"></div>
            <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2 dark:bg-zinc-900/50"></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-muted/50 rounded animate-pulse w-1/3 dark:bg-zinc-900/50"></div>
          <div className="h-8 bg-muted/50 rounded animate-pulse w-20 dark:bg-zinc-900/50"></div>
        </div>
      </div>
    </div>
  );

  const SectionHeaderSkeleton = () => (
    <div className="h-6 bg-muted/50 rounded animate-pulse w-32 mb-4 dark:bg-zinc-900/50"></div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <EventBanner />
      <div className="flex flex-col flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-xl font-medium tracking-tight text-foreground dark:text-zinc-100">
          Клубууд
        </h1>
        <Link
          href="/clubs/create"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-black text-zinc-100 hover:bg-primary/90 transition-colors duration-200 no-underline whitespace-nowrap dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100"
        >
          + Клуб үүсгэх
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <>
          {/* My Clubs Section Skeleton */}
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <ClubCardSkeleton key={`my-${i}`} />
            ))}
          </div>

          {/* Other Clubs Section Skeleton */}
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <ClubCardSkeleton key={`other-${i}`} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* My Clubs Section */}
          {myClubs.length > 0 && (
            <>
              <h2 className="text-lg font-medium tracking-tight text-foreground dark:text-zinc-100 mb-4">
                Гишүүнчлэлтэй
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {myClubs.map((club: any) => (
                  <ClubCard key={club.id} club={club} isMy={true}/>
                ))}
              </div>
            </>
          )}

          {/* Other Clubs Section */}
          {otherClubs.length > 0 && (
            <>
              <h2 className="text-lg font-medium tracking-tight text-foreground dark:text-zinc-100 mb-4">
                Бусад
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {otherClubs.map((club: any) => (
                  <ClubCard key={club.id} club={club} isMy={false} />
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {myClubs.length === 0 && otherClubs.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground text-lg dark:text-gray-300">
                Клуб олдсонгүй
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}