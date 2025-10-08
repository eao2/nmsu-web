"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ClubCard from "@/components/clubs/ClubCard";
import EventBanner from "@/components/layout/EventBanner";

export default function ClubsPage() {
  const { data: session } = useSession();
  const [clubs, setClubs] = useState([]);
  const [filter, setFilter] = useState<"all" | "my">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, [session, filter]);

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clubs?filter=${filter}`);
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error("Fetch clubs error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <EventBanner />
    <div className="flex flex-col flex-row items-center justify-between gap-4 mb-8">
      <h1 className="text-xl font-medium tracking-tight text-foreground dark:text-white">
        Клубууд
      </h1>
        <Link
          href="/clubs/create"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-black text-white hover:bg-primary/90 transition-colors duration-200 no-underline whitespace-nowrap dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          + Клуб үүсгэх
        </Link>
    </div>
    {/* Filter buttons */}
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => setFilter("all")}
        className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 whitespace-nowrap ${
          filter === "all"
            ? "bg-primary text-primary-foreground dark:bg-white dark:text-black bg-black text-white"
            : "bg-card text-foreground hover:bg-muted/50 dark:bg-zinc-900 dark:text-gray-100 dark:hover:bg-zinc-800"
        }`}
      >
        Бүх клубууд
      </button>
      <button
        onClick={() => setFilter("my")}
        className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 whitespace-nowrap ${
          filter === "my"
            ? "bg-primary text-primary-foreground dark:bg-white dark:text-black bg-black text-white"
            : "bg-card text-foreground hover:bg-muted/50 dark:bg-zinc-900 dark:text-gray-100 dark:hover:bg-zinc-800"
        }`}
      >
        Миний клубууд
      </button>
    </div>
    {/* Content */}
    {isLoading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-xl bg-muted/50 animate-pulse border border-border dark:bg-zinc-900/50 dark:border-zinc-800"
          />
        ))}
      </div>
    ) : clubs.length === 0 ? (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground text-lg dark:text-gray-300">
          {filter === "my"
            ? "Та одоогоор ямар ч клубт элссэнгүй"
            : "Клуб олдсонгүй"}
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {clubs.map((club: any) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    )}
  </div>
  );
}
