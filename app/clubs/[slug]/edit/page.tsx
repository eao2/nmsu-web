// app/clubs/[slug]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image'; // 1. Import next/Image

export default function EditClubPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [club, setClub] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    allowJoinRequests: true,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  
  // 2. Add state for image previews
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchClub();
  }, [params.slug]);

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

  const fetchClub = async () => {
    try {
      const response = await fetch(`/api/clubs?slug=${params.slug}`);
      const clubData = await response.json();

      if (clubData) {
        setClub(clubData);
        setFormData({
          title: clubData.title,
          description: clubData.description,
          isPublic: clubData.isPublic,
          allowJoinRequests: clubData.allowJoinRequests,
        });
      }
    } catch (error) {
      console.error('Fetch club error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/upload?folder=${folder}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let updates: any = { ...formData };

      if (profileImage) {
        updates.profileImage = await uploadFile(profileImage, 'clubs/profiles');
      }

      if (coverImage) {
        updates.coverImage = await uploadFile(coverImage, 'clubs/covers');
      }

      const response = await fetch(`/api/clubs/${club.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        router.push(`/clubs/${params.slug}`);
      } else {
        alert('Клуб засахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Update club error:', error);
      alert('Клуб засахад алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Та энэ клубыг устгахдаа итгэлтэй байна уу?')) return;

    try {
      const response = await fetch(`/api/clubs/${club.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/clubs');
      } else {
        alert('Клуб устгахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Delete club error:', error);
      alert('Клуб устгахад алдаа гарлаа');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted/50 rounded-lg w-1/3 mb-4 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
          <div className="h-64 bg-muted/50 rounded-lg border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-zinc-100 mb-2">Клуб олдсонгүй</h1>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-8">Клуб засах</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="my-2">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Клубын нэр *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="my-2">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Тайлбар *
          </label>
          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 resize-y border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="my-2">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Профайл зураг
          </label>
          {/* 4. Use Image component with conditional preview */}
          {(profileImagePreview || club.profileImage) && (
            <Image
              src={profileImagePreview || club.profileImage}
              alt="Profile preview"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover mb-2 border border-border dark:border-zinc-700"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
          />
        </div>

        <div className="my-2">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Ковер зураг
          </label>
          {/* 5. Use Image component with conditional preview */}
          {(coverImagePreview || club.coverImage) && (
            <Image
              src={coverImagePreview || club.coverImage}
              alt="Cover preview"
              width={500}
              height={128}
              className="w-full h-32 object-cover rounded-lg mb-2 border border-border dark:border-zinc-700"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 my-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
            />
            <label htmlFor="isPublic" className="text-sm text-muted-foreground dark:text-gray-400">
              Нийтэд нээлттэй
            </label>
          </div>

          <div className="flex items-center gap-2 my-2">
            <input
              type="checkbox"
              id="allowJoinRequests"
              checked={formData.allowJoinRequests}
              onChange={(e) => setFormData({ ...formData, allowJoinRequests: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
            />
            <label htmlFor="allowJoinRequests" className="text-sm text-muted-foreground dark:text-gray-400">
              Элсэлтийн хүсэлт хүлээн авах
            </label>
          </div>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Буцах
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100"
          >
            {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>

        {/* <div className="pt-6 border-border dark:border-zinc-700">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-6 py-3 bg-red-600 text-zinc-100 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Клуб устгах
          </button>
        </div> */}
      </form>
    </div>
  );
}