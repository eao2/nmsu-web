// app/clubs/[slug]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  useEffect(() => {
    fetchClub();
  }, [params.slug]);

  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setProfileImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProfileImagePreview(null);
    }
  }, [profileImage]);

  useEffect(() => {
    if (coverImage) {
      const url = URL.createObjectURL(coverImage);
      setCoverImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverImagePreview(null);
    }
  }, [coverImage]);

  const fetchClub = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/clubs?slug=${params.slug}`);
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

    const response = await fetch(`${apiUrl}/api/upload?folder=${folder}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let updates: any = { ...formData };

      if (profileImage) {
        updates.profileImage = await uploadFile(profileImage, 'clubs-profiles');
      }

      if (coverImage) {
        updates.coverImage = await uploadFile(coverImage, 'clubs-covers');
      }

      const response = await fetch(`${apiUrl}/api/clubs/${club.id}`, {
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
      const response = await fetch(`${apiUrl}/api/clubs/${club.id}`, {
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

  const currentCoverImage = coverImagePreview || (club.coverImage ? process.env.NEXT_PUBLIC_GET_FILE_URL + club.coverImage : null);
  const currentProfileImage = profileImagePreview || (club.profileImage ? process.env.NEXT_PUBLIC_GET_FILE_URL + club.profileImage : null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-2">
        Клуб засах
      </h1>
      <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
        Клубын мэдээллээ шинэчилнэ үү
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club Card Preview */}
        <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
          {/* Cover Image Section */}
          <div className="relative w-full h-48 group">
            {currentCoverImage ? (
              <Image
                src={currentCoverImage}
                alt="Cover preview"
                fill
                className="object-cover border-b border-border dark:border-zinc-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 border-b border-border dark:border-zinc-700 flex items-center justify-center">
                <span className="text-white/60 text-sm">Ковер зураг нэмнэ үү</span>
              </div>
            )}
            <label className="absolute inset-0 bg-black/40 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
              <span className="px-4 py-2 bg-white/90 text-gray-900 rounded-lg text-sm font-medium">
                Зураг солих
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Club Info Section */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              {/* Profile Image */}
              <div className="relative w-16 h-16 flex-shrink-0 group">
                {currentProfileImage ? (
                  <Image
                    src={currentProfileImage}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover border-2 border-border dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-2xl border-2 border-border dark:bg-zinc-100 dark:text-black dark:border-white">
                    {formData.title.charAt(0) || "?"}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Club Title */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Клубын нэр"
                  className="w-full text-lg font-semibold bg-transparent border-none outline-none text-foreground dark:text-zinc-100 placeholder:text-muted-foreground/50 focus:ring-0 p-0"
                />
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                  {club._count?.members || 0} гишүүн
                </p>
              </div>
            </div>

            {/* Description */}
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Клубын тухай дэлгэрэнгүй мэдээлэл бичнэ үү..."
              className="w-full resize-none px-0 py-2 bg-transparent border-none outline-none text-sm text-muted-foreground dark:text-gray-400 placeholder:text-muted-foreground/50 focus:ring-0"
            />

            {/* Status Badges */}
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
                />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.isPublic
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400"
                  }`}
                >
                  {formData.isPublic ? "Нээлттэй" : "Хаалттай"}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowJoinRequests}
                  onChange={(e) =>
                    setFormData({ ...formData, allowJoinRequests: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
                />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.allowJoinRequests
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400"
                  }`}
                >
                  {formData.allowJoinRequests ? "Элсэлт Авна" : "Элсэлт Хаалттай"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 my-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex justify-center items-center border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700 min-w-12 h-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>
            </svg>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100 font-medium"
          >
            {isSaving ? 'Хадгалж байна...' : 'Өөрчлөлт хадгалах'}
          </button>
        </div>

        {/* Delete Button (Optional - commented out in original) */}
        {/* <div className="pt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            Клуб устгах
          </button>
        </div> */}
      </form>
    </div>
  );
}