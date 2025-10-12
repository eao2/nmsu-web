"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface Schedule {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
}

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Даваа' },
  { value: 'TUESDAY', label: 'Мягмар' },
  { value: 'WEDNESDAY', label: 'Лхагва' },
  { value: 'THURSDAY', label: 'Пүрэв' },
  { value: 'FRIDAY', label: 'Баасан' },
  { value: 'SATURDAY', label: 'Бямба' },
  { value: 'SUNDAY', label: 'Ням' },
];

export default function CreateClubPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reason: "",
    isPublic: true,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
    room: '',
  });
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

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

  const uploadFile = async (file: File, folder: string) => {
    const formDataToUpload = new FormData();
    formDataToUpload.append("file", file);

    const response = await fetch(`${apiUrl}/api/upload?folder=${folder}`, {
      method: "POST",
      body: formDataToUpload,
    });

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.key;
  };

  const addSchedule = () => {
    if (!newSchedule.startTime || !newSchedule.endTime || !newSchedule.room) {
      alert("Бүх талбарыг бөглөнө үү");
      return;
    }

    // Check for duplicate room/day/time
    const conflict = schedules.find(
      (s) =>
        s.room === newSchedule.room &&
        s.dayOfWeek === newSchedule.dayOfWeek &&
        s.startTime === newSchedule.startTime
    );

    if (conflict) {
      alert("Энэ өрөө, өдөр, цагт аль хэдийн хуваарь байна");
      return;
    }

    setSchedules([...schedules, { ...newSchedule }]);
    setNewSchedule({
      dayOfWeek: 'MONDAY',
      startTime: '',
      endTime: '',
      room: '',
    });
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let profileImageKey = null;
      let coverImageKey = null;

      if (profileImage) {
        profileImageKey = await uploadFile(profileImage, "clubs-profiles");
      }

      if (coverImage) {
        coverImageKey = await uploadFile(coverImage, "clubs-covers");
      }

      const response = await fetch(`${apiUrl}/api/clubs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileImage: profileImageKey,
          coverImage: coverImageKey,
          schedules,
        }),
      });

      if (response.ok) {
        const club = await response.json();
        router.push(`/clubs/${club.slug}`);
      } else {
        const error = await response.json();
        alert(error.error || "Клуб үүсгэхэд алдаа гарлаа");
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

        <div className="my-4">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Клуб үүсгэх шалтгаан *
          </label>
          <textarea
            required
            rows={3}
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Яагаад энэ клубыг үүсгэх гэж байгаагаа тайлбарлана уу..."
            className="w-full resize-y px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="my-4">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Профайл зураг
          </label>
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

        <div className="my-4">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Ковер зураг
          </label>
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

        {/* Schedule Section */}
        <div className="my-6 p-4 border border-border rounded-lg dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-foreground dark:text-zinc-100 mb-4">
            Клубын хуваарь
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                Өдөр
              </label>
              <select
                value={newSchedule.dayOfWeek}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value as DayOfWeek })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                Өрөө
              </label>
              <input
                type="text"
                value={newSchedule.room}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, room: e.target.value })
                }
                placeholder="301"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                Эхлэх цаг
              </label>
              <input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, startTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                Дуусах цаг
              </label>
              <input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addSchedule}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Хуваарь нэмэх
          </button>

          {schedules.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                Нэмсэн хуваарь:
              </h4>
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg dark:bg-zinc-800/50"
                >
                  <div className="text-sm text-foreground dark:text-zinc-100">
                    <span className="font-medium">
                      {DAYS.find((d) => d.value === schedule.dayOfWeek)?.label}
                    </span>
                    {" • "}
                    {schedule.startTime} - {schedule.endTime}
                    {" • "}
                    Өрөө: {schedule.room}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Устгах
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

        <div className="my-4 bg-muted/50 rounded-lg border border-border p-4 dark:bg-zinc-800/50 dark:border-zinc-700">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Клуб үүсгэсний дараа Оюутны Холбооноос баталгаажуулах шаардлагатай
          </p>
        </div>

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