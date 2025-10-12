// components/posts/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Create comment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-border p-6 bg-muted/50 dark:bg-zinc-800/50 dark:border-zinc-700">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-3">
          {session?.user?.image ? (
            <div className="relative w-9 h-9 rounded-full">
              <Image
                src={process.env.NEXT_PUBLIC_GET_FILE_URL + session.user.image}
                alt={session.user.name || ""}
                fill
                className="w-9 h-9 rounded-full object-cover border border-border dark:border-zinc-700"
              />
            </div>
          ) : (
            <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-foreground text-sm font-semibold border border-border dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Сэтгэгдэл бичих..."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent text-sm placeholder:text-muted-foreground transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            {newComment && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100"
              >
                {isSubmitting ? "Илгээж байна..." : "Илгээх"}
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {comment.author.image ? (
              <Image
                src={process.env.NEXT_PUBLIC_GET_FILE_URL + comment.author.image}
                alt={comment.author.name}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border border-border dark:border-zinc-700"
              />
            ) : (
              <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-foreground text-sm font-semibold border border-border dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700">
                {comment.author.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1">
              <div className="bg-card border border-border rounded-xl px-4 py-2 dark:bg-zinc-900 dark:border-zinc-800">
                <h4 className="font-medium text-sm text-foreground dark:text-zinc-100">
                  {comment.author.name}
                </h4>
                <p className="text-sm text-foreground mt-0.5 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
              <span className="text-xs text-muted-foreground ml-4 mt-1 block dark:text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("mn-MN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}