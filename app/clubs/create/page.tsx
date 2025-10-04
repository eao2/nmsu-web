"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

  // if (session?.user?.role === 'STUDENT') {
  //   return (
  //     <div className="max-w-2xl mx-auto px-4 py-12">
  //       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
  //         <p className="text-yellow-800">
  //           Зөвхөн клубын админ эсвэл платформын админ клуб үүсгэх боломжтой
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white mb-8">
        Шинэ клуб үүсгэх
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800"
      >
        {/* Club Name */}
        <div className='my-2'>
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
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Description */}
        <div className='my-2'>
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
            className="w-full resize-y px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Profile Image */}
        <div className='my-2'>
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Профайл зураг
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
          />
        </div>

        {/* Cover Image */}
        <div className='my-2'>
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Ковер зураг
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
          />
        </div>

        {/* Public Checkbox */}
        <div className="flex items-center gap-2 my-2">
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
        <div className="my-2 bg-muted/50 rounded-lg border border-border p-4 dark:bg-zinc-800/50 dark:border-zinc-700">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Клуб үүсгэсний дараа Оюутны Холбооноос баталгаажуулах шаардлагатай
          </p>
        </div>

        {/* Action Buttons */}
        <div className="my-2 flex gap-4 flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 rounded-lg border border-border bg-background text-foreground hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            Буцах
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            {isLoading ? "Үүсгэж байна..." : "Клуб үүсгэх"}
          </button>
        </div>
      </form>
    </div>
  );
}
