// app/clubs/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image"; // 1. Import next/Image and useEffect

export default function CreateClubPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // 2. Add state for image preview URLs
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  // 3. Create a useEffect to generate and clean up preview URLs
  useEffect(() => {
    let profileUrl: string | null = null;
    if (profileImage) {
      profileUrl = URL.createObjectURL(profileImage);
      setProfileImagePreview(profileUrl);
    }

    let coverUrl: string | null = null;
    if (coverImage) {
      coverUrl = URL.createObjectURL(coverImage);
      setCoverImagePreview(coverUrl);
    }

    // Cleanup function to revoke object URLs and prevent memory leaks
    return () => {
      if (profileUrl) {
        URL.revokeObjectURL(profileUrl);
      }
      if (coverUrl) {
        URL.revokeObjectURL(coverUrl);
      }
    };
  }, [profileImage, coverImage]);

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/upload?folder=${folder}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let profileImagePath = null;
      let coverImagePath = null;

      if (profileImage) {
        profileImagePath = await uploadFile(profileImage, "clubs/profiles");
      }

      if (coverImage) {
        coverImagePath = await uploadFile(coverImage, "clubs/covers");
      }

      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileImage: profileImagePath,
          coverImage: coverImagePath,
        }),
      });

      if (response.ok) {
        const club = await response.json();
        router.push(`/clubs/${club.slug}`);
      }
    } catch (error) {
      console.error("Create club error:", error);
      alert("Клуб үүсгэхэд алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-8">
        Шинэ клуб үүсгэх
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800"
      >
        {/* Club Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Клубын нэр *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Спортын клуб"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Description */}
        <div className="my-4">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Тайлбар *
          </label>
          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Клубын тухай дэлгэрэнгүй мэдээлэл..."
            className="w-full resize-y px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Profile Image */}
        <div className="my-4">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Профайл зураг
          </label>
          {/* 4. Conditionally render the preview image */}
          {profileImagePreview && (
            <Image
              src={profileImagePreview}
              alt="Profile preview"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover mb-4 border border-border dark:border-zinc-700"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
          />
        </div>

        {/* Cover Image */}
        <div className="my-4">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Ковер зураг
          </label>
          {/* 4. Conditionally render the preview image */}
          {coverImagePreview && (
            <Image
              src={coverImagePreview}
              alt="Cover preview"
              width={500}
              height={128}
              className="w-full h-32 object-cover rounded-lg mb-4 border border-border dark:border-zinc-700"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
          />
        </div>

        {/* Public Checkbox */}
        <div className="flex items-center gap-2 my-4">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) =>
              setFormData({ ...formData, isPublic: e.target.checked })
            }
            className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
          />
          <label
            htmlFor="isPublic"
            className="text-sm text-muted-foreground dark:text-gray-400"
          >
            Нийтэд нээлттэй
          </label>
        </div>

        {/* Admin Notice */}
        <div className="my-4 bg-muted/50 rounded-lg border border-border p-4 dark:bg-zinc-800/50 dark:border-zinc-700">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Клуб үүсгэсний дараа Оюутны Холбооноос баталгаажуулах шаардлагатай
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 w-full">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex justify-center items-center border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700 min-w-10 h-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-circle dark:text-zinc-100" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>
            </svg>
          </button>
          <button
            type="submit"
            disabled={isLoading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100"
          >
            {isLoading ? "Үүсгэж байна..." : "Клуб үүсгэх"}
          </button>
        </div>
      </form>
    </div>
  );
}