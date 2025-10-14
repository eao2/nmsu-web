// components/posts/PostCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import CommentSection from "./CommentSection";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface PostCardProps {
  post: any;
  clubSlug: string;
}

// Video player component
const VideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement("video");
      videoElement.className = "video-js vjs-default-skin";
      videoElement.controls = true;
      videoElement.preload = "auto";
      (videoElement as any).width = "100%";
      (videoElement as any).height = "auto";
      videoElement.setAttribute("data-setup", "{}");

      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4"; // Default to mp4, you can enhance this to detect other types

      videoElement.appendChild(source);
      videoRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, {
        fluid: true,
        responsive: true,
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return <div ref={videoRef} className="w-full" />;
};

export default function PostCard({ post, clubSlug }: PostCardProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(post._count?.likes || 0);
  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [showComments, setShowComments] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  const handleLike = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLike: !hasLiked }),
      });

      if (response.ok) {
        const data = await response.json();
        setHasLiked(data.hasLiked);
        setLikes(data.likeCount);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  // Function to determine file type
  const getFileType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) {
      return 'video';
    }
    return 'document';
  };

  // Function to get file icon based on type
  const getFileIcon = (filename: string) => {
    const type = getFileType(filename);
    if (type === 'image') {
      return (
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (type === 'video') {
      return (
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
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
    );
  };

  return (
    <div className="my-4 bg-zinc-100 border border-border rounded-lg overflow-hidden text-foreground dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {post.author.image ? (
            <div className="relative">
              <Image
                src={process.env.NEXT_PUBLIC_GET_FILE_URL + post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-border dark:border-zinc-700"
              />
            </div>
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
          <div className="mb-4">
            {post.attachments.length === 1 ? (
              // Single attachment - full width
              <div className="relative">
                {getFileType(post.attachments[0]) === 'image' ? (
                  <div className="relative">
                    <Image
                      src={process.env.NEXT_PUBLIC_GET_FILE_URL + post.attachments[0]}
                      alt="Attachment"
                      width={800}
                      height={0}
                      className="w-full h-auto object-cover rounded-lg border border-border dark:border-zinc-700"
                    />
                    <a
                      href={process.env.NEXT_PUBLIC_GET_FILE_URL + post.attachments[0]}
                      download
                      className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ) : getFileType(post.attachments[0]) === 'video' ? (
                  <div className="relative">
                    <VideoPlayer src={process.env.NEXT_PUBLIC_GET_FILE_URL + post.attachments[0]} />
                    <a
                      href={process.env.NEXT_PUBLIC_GET_FILE_URL + post.attachments[0]}
                      download
                      className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                      title="Download"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"/>
                        <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                      </svg>
                    </a>
                  </div>
                ) : (
                  <a
                    href={process.env.NEXT_PUBLIC_GET_FILE_URL + post.attachments[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200 no-underline dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                  >
                    {getFileIcon(post.attachments[0])}
                    <span className="text-sm text-foreground truncate dark:text-gray-300">
                      {post.attachments[0].split("/").pop()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(process.env.NEXT_PUBLIC_GET_FILE_URL + post.attachments[0], '_blank');
                      }}
                      className="ml-auto p-1 rounded hover:bg-muted/70 dark:hover:bg-zinc-700"
                      title="Download"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"/>
                        <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                      </svg>
                    </button>
                  </a>
                )}
              </div>
            ) : (
              // Multiple attachments - grid layout
              <div className={`grid grid-cols-1 gap-2 ${
                post.attachments.length === 2 ? 'sm:grid-cols-2' : 
                post.attachments.length === 3 ? 'grid-cols-1 md:grid-cols-2' : 
                'grid-cols-2'
              }`}>
                {post.attachments.map((file: string, index: number) => {
                  const fileType = getFileType(file);
                  const fileUrl = process.env.NEXT_PUBLIC_GET_FILE_URL + file;
                  
                  return fileType === 'image' ? (
                    <div key={index} className="relative">
                      <div className="aspect-square overflow-hidden rounded-lg border border-border dark:border-zinc-700">
                        <Image
                          src={fileUrl}
                          alt="Attachment"
                          fill
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <a
                        href={fileUrl}
                        download
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full transition-opacity hover:bg-black/70"
                        title="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"/>
                          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                        </svg>
                      </a>
                    </div>
                  ) : fileType === 'video' ? (
                    <div key={index} className="relative">
                      <div className="aspect-video overflow-hidden rounded-lg border border-border dark:border-zinc-700">
                        <VideoPlayer src={fileUrl} />
                      </div>
                      <a
                        href={fileUrl}
                        download
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full z-10 hover:bg-black/70"
                        title="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"/>
                          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <a
                      key={index}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200 no-underline dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                    >
                      {getFileIcon(file)}
                      <span className="text-sm text-foreground truncate dark:text-gray-300">
                        {file.split("/").pop()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(fileUrl, '_blank');
                        }}
                        className="ml-auto p-1 rounded hover:bg-muted/70 dark:hover:bg-zinc-700"
                        title="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"/>
                          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                        </svg>
                      </button>
                    </a>
                  );
                })}
              </div>
            )}
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