"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/posts/PostCard";
import PostForm from "@/components/posts/PostForm";
import Image from "next/image"

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [club, setClub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "members" | "about">(
    "posts"
  );
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // console.log("sesuserid", session?.user?.id)
    fetchClub();
  }, [session, params.slug]);

  const fetchClub = async () => {
    try {
      // const response = await fetch(`/api/clubs?slug=${params.slug}`);
      const response = await fetch(`/api/clubs/${params.slug}`);
      const clubData = await response.json();

      const userId = session?.user?.id;

      if (clubData) {
        setClub(clubData);

        const member = clubData.members?.find(
          (m: any) => m.userId === userId,
          console.log("Session User ID:", userId)
        );
        console.log("Member:", member);
        setIsMember(!!member);
        setIsAdmin(member?.isAdmin || false);
      }
    } catch (error) {
      console.error("Fetch club error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!club.allowJoinRequests) {
      alert("Клуб одоогоор элсэлт хүлээн авахгүй байна");
      return;
    }
    router.push(`/clubs/${params.slug}/join`);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-muted/50 rounded-lg mb-6 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
          <div className="h-8 bg-muted/50 rounded-md w-1/3 mb-4 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
          <div className="h-4 bg-muted/50 rounded-md w-2/3 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  if (!club || club.error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
          Клуб олдсонгүй
        </h1>
        <Link
          href="/clubs"
          className="text-primary hover:text-primary/80 transition-colors duration-200 no-underline hover:underline underline-offset-4 dark:text-white dark:hover:text-gray-300"
        >
          Клубууд руу буцах
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative w-full h-64 rounded-lg mb-4">
        {club.coverImage ? (
          <Image
            src={club.coverImage}
            alt={club.title}
            fill
            className="w-full h-full object-cover rounded-lg border border-border dark:border-zinc-800"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg border border-border dark:border-zinc-800" />
        )}

        {isMember || (
          <button
            onClick={handleJoinRequest}
            disabled={!club.allowJoinRequests}
            className="absolute right-4 bottom-4 px-4 py-2 
                      bg-gray-100 text-gray-900 
                      dark:bg-white dark:text-gray-900 
                      rounded-md font-medium border border-gray-300 dark:border-gray-900 
                      hover:bg-gray-200 dark:hover:bg-gray-50 text-base"
          >
            {club.allowJoinRequests ? "Элсэх хүсэлт илгээх" : "Элсэлт хаалттай"}
          </button>
        )}
      </div>

      {/* Club Header */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-start gap-4 mb-4">
        {club.profileImage ? (
          <div className="relative w-20 h-20 rounded-full border border-border dark:border-zinc-800 overflow-hidden">
            <Image
              src={club.profileImage}
              alt={club.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl border border-border dark:bg-white dark:text-black dark:border-white">
            {club.title.charAt(0)}
          </div>
        )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground dark:text-white mb-2">
                  {club.title}
                </h1>
                <p className="text-muted-foreground dark:text-gray-300 mb-3">
                  {club._count?.members || 0} гишүүн
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isMember && (
                  <>
                    {isAdmin ? (
                        <>
                          <Link
                            href={`/clubs/${params.slug}/edit`}
                            className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors duration-200 no-underline dark:bg-zinc-800 dark:text-gray-100 dark:hover:bg-zinc-700"
                          >
                            Засах
                          </Link>
                          <span className="px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 rounded-md font-medium border border-green-500/20 dark:border-green-500/30">
                            Админ
                          </span>
                        </>
                      ) : (
                        <span className="px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 rounded-md font-medium border border-green-500/20 dark:border-green-500/30">
                          Гишүүн
                        </span>
                      )
                    }
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border dark:border-zinc-800 pt-4">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-2 px-3 font-medium transition-colors duration-200 rounded-md outline-none border-none ${
                activeTab === "posts"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-black dark:text-white hover:text-foreground dark:bg-zinc-700"
              }`}
            >
              Нийтлэлүүд
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`py-2 px-3 font-medium transition-colors duration-200 rounded-md outline-none border-none ${
                activeTab === "members"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-black dark:text-white hover:text-foreground dark:bg-zinc-700"
              }`}
            >
              Гишүүд
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-2 px-3 font-medium transition-colors duration-200 rounded-md outline-none border-none ${
                activeTab === "about"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-black dark:text-white hover:text-foreground dark:bg-zinc-700"
              }`}
            >
              Тухай
            </button>
            {isAdmin && (
              <>
                <Link
                  href={`/clubs/${params.slug}/attendance`}
                  className="py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Ирц
                </Link>
                <Link
                  href={`/clubs/${params.slug}/reports`}
                  className="py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Тайлан
                </Link>
                <Link
                  href={`/clubs/${params.slug}/join-form`}
                  className="py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Порм Засах
                </Link>
                <Link
                  href={`/clubs/${params.slug}/requests`}
                  className="py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Хүсэлтүүд
                </Link>
                <Link
                  href={`/clubs/${params.slug}/reports`}
                  className="py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Тайлан
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {isMember && <PostForm clubId={club.id} onPostCreated={fetchClub} />}

          {club.posts?.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center dark:bg-zinc-900 dark:border-zinc-800 mt-4">
              <p className="text-muted-foreground dark:text-gray-300">
                Нийтлэл байхгүй байна
              </p>
            </div>
          ) : (
            club.posts?.map((post: any) => (
              <PostCard key={post.id} post={post} clubSlug={club.slug} />
            ))
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="bg-card border border-border rounded-lg p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-4">
            Гишүүд ({club.members?.length || 0})
          </h2>
          <div className="space-y-3">
            {club.members?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors duration-200 dark:hover:bg-zinc-800"
              >
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name}
                    className="w-12 h-12 rounded-full object-cover border border-border dark:border-zinc-800"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-medium border border-border dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700">
                    {member.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-foreground dark:text-gray-100">
                    {member.user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    {member.user.studentCode} • {member.user.className}
                  </p>
                </div>
                {member.isAdmin && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 dark:bg-white/10 dark:text-white dark:border-white/20">
                    Админ
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "about" && (
        <div className="bg-card border border-border rounded-lg p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-4">
            Тайлбар
          </h2>
          <p className="text-foreground dark:text-gray-200 whitespace-pre-line">
            {club.description}
          </p>

          <div className="mt-6 pt-6 border-t border-border dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground dark:text-gray-400">
                  Төрөл:
                </span>
                <span className="ml-2 font-medium text-foreground dark:text-gray-100">
                  {club.isPublic ? "Нээлттэй" : "Хаалттай"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground dark:text-gray-400">
                  Үүсгэсэн:
                </span>
                <span className="ml-2 font-medium text-foreground dark:text-gray-100">
                  {new Date(club.createdAt).toLocaleDateString("mn-MN")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground dark:text-gray-400">
                  Үүсгэгч:
                </span>
                <span className="ml-2 font-medium text-foreground dark:text-gray-100">
                  {club.creator.name}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground dark:text-gray-400">
                  Элсэлт:
                </span>
                <span className="ml-2 font-medium text-foreground dark:text-gray-100">
                  {club.allowJoinRequests ? "Нээлттэй" : "Хаалттай"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
