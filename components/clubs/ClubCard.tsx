import Link from "next/link";
import Image from "next/image";

interface ClubCardProps {
  isMy?: boolean;
  club: any;
}

export default function ClubCard({ club, isMy }: ClubCardProps) {
  return (
    <Link href={`/clubs/${club.slug}`} className="block no-underline">
      <div className="rounded-xl border border-border bg-card text-card-foreground hover:bg-muted/50 transition-all duration-200 cursor-pointer overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
        {club.coverImage ? (
          <div className="relative w-full h-48">
            <Image
              src={club.coverImage}
              alt={club.title}
              fill
              className="object-cover border-b border-border dark:border-zinc-700"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 border-b border-border dark:border-zinc-700" />
        )}

        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              {club.profileImage ? (
                <Image
                  src={club.profileImage}
                  alt={club.title}
                  fill
                  className="rounded-full object-cover border border-border dark:border-zinc-700"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg border border-border dark:bg-zinc-100 dark:text-black dark:border-white">
                  {club.title.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground dark:text-zinc-100 truncate">
                {club.title}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {club._count?.members || 0} гишүүн
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 mb-3">
            {club.description}
          </p>

          <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-gray-400">
            {isMy ? (
              <span>{club._count?.posts || 0} нийтлэл</span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  club.allowJoinRequests
                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400"
                }`}
              >
                {club.allowJoinRequests ? "Элсэлт Авна" : "Элсэлт Хаалттай"}
              </span>
            )}
            {/* <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                club.isPublic
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400"
              }`}
            >
              {club.isPublic ? "Нээлттэй" : "Хаалттай"}
            </span> */}
          </div>
        </div>
      </div>
    </Link>
  );
}
