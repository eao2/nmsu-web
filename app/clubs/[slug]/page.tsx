// app/clubs/[slug]/page.tsx
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  useEffect(() => {
    fetchClub();
  }, [session, params.slug]);

  const fetchClub = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/clubs?slug=${params.slug}`);
      const clubData = await response.json();

      const userId = session?.user?.id;

      if (clubData) {
        setClub(clubData);

        const member = clubData.members?.find(
          (m: any) => m.userId === userId
        );
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
        <h1 className="text-2xl font-bold text-foreground dark:text-zinc-100 mb-2">
          Клуб олдсонгүй
        </h1>
        <Link
          href="/clubs"
          className="text-primary hover:text-primary/80 transition-colors duration-200 no-underline hover:underline underline-offset-4 dark:text-zinc-100 dark:hover:text-gray-300"
        >
          Клубууд руу буцах
        </Link>
      </div>
    );
  }

  // Check if user has a pending join request
  const hasPendingRequest = club.userJoinRequest?.status === 'PENDING';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative w-full h-64 rounded-lg mb-4">
        {club.coverImage ? (
          <Image
            src={process.env.NEXT_PUBLIC_GET_FILE_URL + club.coverImage}
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
            disabled={!club.allowJoinRequests || hasPendingRequest}
            className="absolute right-4 bottom-4 px-4 py-2 
                      bg-gray-100 text-gray-900 
                      dark:bg-zinc-100 dark:text-gray-900 
                      rounded-md font-medium border border-gray-300 dark:border-gray-900 
                      hover:bg-gray-200 dark:hover:bg-gray-50 text-base
                      disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {hasPendingRequest 
              ? "Элсэх хүсэлт илгээсэн" 
              : club.allowJoinRequests 
                ? "Элсэх хүсэлт илгээх" 
                : "Элсэлт хаалттай"
            }
          </button>
        )}
      </div>

      {/* Club Header */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex items-start gap-4 mb-4">
        {club.profileImage ? (
          <div className="relative w-20 h-20 rounded-full border border-border dark:border-zinc-800 overflow-hidden">
            <Image
              src={process.env.NEXT_PUBLIC_GET_FILE_URL + club.profileImage}
              alt={club.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl border border-border dark:bg-zinc-100 dark:text-black dark:border-white">
            {club.title.charAt(0)}
          </div>
        )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground dark:text-zinc-100 mb-2">
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
                            className="px-4 py-2 bg-zinc-200 text-foreground rounded-md hover:bg-muted/80 transition-colors duration-200 no-underline dark:bg-zinc-800 dark:text-gray-100 dark:hover:bg-zinc-700 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square dark:text-gray-100" viewBox="0 0 16 16">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                              <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                            </svg>
                          </Link>
                        </>
                      ) : (
                        <span className="felx items-center justify-center px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 rounded-md font-medium border border-green-500/20 dark:border-green-500/30">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
                            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                          </svg>
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
          <div className="flex gap-4 overflow-x-auto scroll-hidden">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-2 px-3 font-medium transition-colors duration-200 rounded-md outline-none border-none ${
                activeTab === "posts"
                  ? "bg-black text-zinc-100 dark:bg-zinc-100 dark:text-black"
                  : "text-black dark:text-zinc-100 hover:text-foreground dark:bg-zinc-700"
              }`}
            >
              Нийтлэлүүд
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`py-2 px-3 font-medium transition-colors duration-200 rounded-md outline-none border-none ${
                activeTab === "members"
                  ? "bg-black text-zinc-100 dark:bg-zinc-100 dark:text-black"
                  : "text-black dark:text-zinc-100 hover:text-foreground dark:bg-zinc-700"
              }`}
            >
              Гишүүд
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-2 px-3 font-medium transition-colors duration-200 rounded-md outline-none border-none ${
                activeTab === "about"
                  ? "bg-black text-zinc-100 dark:bg-zinc-100 dark:text-black"
                  : "text-black dark:text-zinc-100 hover:text-foreground dark:bg-zinc-700"
              }`}
            >
              Тухай
            </button>
            {isAdmin && (
              <div className="flex text-nowrap gap-4">
                <Link
                  href={`/clubs/${params.slug}/attendance`}
                  className="flex items-center justify-center py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Ирц
                </Link>
                <Link
                  href={`/clubs/${params.slug}/reports`}
                  className="flex items-center justify-center py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Тайлан
                </Link>
                <Link
                  href={`/clubs/${params.slug}/join-form`}
                  className="flex items-center justify-center py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Порм Засах
                </Link>
                <Link
                  href={`/clubs/${params.slug}/requests`}
                  className="flex items-center justify-center py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Элсэх Хүсэлтүүд
                </Link>
                <Link
                  href={`/clubs/${params.slug}/leave-requests`}
                  className="flex items-center justify-center py-1 font-medium transition-colors duration-200 rounded-md outline-none border-none text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Гарах Хүсэлтүүд
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {isMember && <>
          <PostForm clubId={club.id} onPostCreated={fetchClub} />
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
          </>}
        </div>
      )}

      {activeTab === "members" && (
        <div className="bg-card border border-border rounded-lg p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-foreground dark:text-zinc-100 mb-4">
            Гишүүд ({club.members?.length || 0})
          </h2>
          <div className="space-y-3">
            {club.members?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors duration-200 dark:hover:bg-zinc-800"
              >
                {member.user.image ? (
                  <div className="relative w-12 h-12 rounded-full object-cover border border-border dark:border-zinc-800">
                    <Image
                      src={process.env.NEXT_PUBLIC_GET_FILE_URL + member.user.image}
                      alt={member.user.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border border-border dark:border-zinc-800"
                    />
                  </div>
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
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 dark:bg-zinc-100/10 dark:text-zinc-100 dark:border-white/20">
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
          <h2 className="text-xl font-bold text-foreground dark:text-zinc-100 mb-4">
            Тайлбар
          </h2>
          <p className="text-foreground dark:text-gray-200 whitespace-pre-line mb-6">
            {club.description}
          </p>

          {club.schedules && club.schedules.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-foreground dark:text-zinc-100 mb-3 mt-6">
                Хуваарь
              </h3>
              <div className="space-y-2">
                {club.schedules
                  .sort((a: any, b: any) => {
                    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
                    return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
                  })
                  .map((schedule: any) => {
                    const dayLabels: Record<string, string> = {
                      MONDAY: 'Даваа',
                      TUESDAY: 'Мягмар',
                      WEDNESDAY: 'Лхагва',
                      THURSDAY: 'Пүрэв',
                      FRIDAY: 'Баасан',
                      SATURDAY: 'Бямба',
                      SUNDAY: 'Ням',
                    };
                    
                    return (
                      <div
                        key={schedule.id}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border dark:bg-zinc-800/50 dark:border-zinc-700"
                      >
                        <div className="flex items-center gap-2 text-sm text-foreground dark:text-zinc-100">
                          <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{dayLabels[schedule.dayOfWeek]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground dark:text-zinc-100">
                          <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground dark:text-zinc-100">
                          <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Өрөө {schedule.room}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {isAdmin && (
                <Link
                  href={`/clubs/${params.slug}/schedules`}
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
                >
                  Хуваарь засах
                </Link>
              )}
            </>
          )}


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
            {(isMember && !isAdmin) && (
              <div>
                <Link href={`/clubs/${params.slug}/leave`} className="bg-red-100 text-red-900 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 px-4 py-2 rounded-md font-medium mt-6 inline-block no-underline">
                  Клубээс гарах
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}