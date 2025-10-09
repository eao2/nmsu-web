// components/posts/PostCard.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: any;
  clubSlug: string;
}

export default function PostCard({ post, clubSlug }: PostCardProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post._count?.likes || 0);
  const [hasLiked, setHasLiked] = useState(
    post.likes?.some(
      (like: any) => like.userId === session?.user?.id && like.isLike
    )
  );
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLike: !hasLiked }),
      });

      if (response.ok) {
        setHasLiked(!hasLiked);
        setLikes(hasLiked ? likes - 1 : likes + 1);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  return (
    <div className="my-4 bg-zinc-100 border border-border rounded-lg overflow-hidden text-foreground dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {post.author.image ? (
            <Image
              src={post.author.image}
              alt={post.author.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border border-border dark:border-zinc-700"
            />
          ) : (
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-medium border border-border dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700">
              {post.author.name?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium text-foreground dark:text-zinc-100">{post.author.name}</h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString("mn-MN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <p className="text-foreground dark:text-gray-200 mb-4 whitespace-pre-line">
          {post.content}
        </p>

        {post.attachments && post.attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.attachments.map((file: string, index: number) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
              return isImage ? (
                <Image
                  key={index}
                  src={file}
                  alt="Attachment"
                  width={300}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg border border-border dark:border-zinc-700"
                />
              ) : (
                <a
                  key={index}
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200 no-underline dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                >
                  <svg
                    className="w-6 h-6 text-muted-foreground dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-foreground truncate dark:text-gray-300">
                    {file.split("/").pop()}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border dark:border-zinc-700">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              hasLiked
                ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary"
                : "bg-muted/50 text-muted-foreground hover:bg-muted/70 dark:bg-zinc-800/50 dark:text-gray-400 dark:hover:bg-zinc-800"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={hasLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span className="font-medium">{likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted/70 transition-colors duration-200 dark:bg-zinc-800/50 dark:text-gray-400 dark:hover:bg-zinc-800"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">{post._count?.comments || 0}</span>
          </button>
        </div>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}