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

    // Validate startTime < endTime
    if (newSchedule.startTime >= newSchedule.endTime) {
      alert("Эхлэх цаг дуусах цагаас өмнө байх ёстой");
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
      <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-2">
        Шинэ клуб үүсгэх
      </h1>
      <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
        Та клубын мэдээллээ бөглөж, хуваарь нэмнэ үү
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club Card Preview */}
        <div className="rounded-xl border border-border bg-card text-card-foreground overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 my-4">
          {/* Cover Image Section */}
          <div className="relative w-full h-48 group">
            {coverImagePreview ? (
              <Image
                src={coverImagePreview}
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
          <div className="p-6 my-4">
            <div className="flex items-start gap-4 mb-4">
              {/* Profile Image */}
              <div className="relative w-16 h-16 flex-shrink-0 group">
                {profileImagePreview ? (
                  <Image
                    src={profileImagePreview}
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

            {/* Status Badge */}
            <div className="flex items-center justify-between mt-4">
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
            </div>
          </div>
        </div>

        {/* Reason Section */}
        <div className="rounded-xl border border-border bg-card p-6 dark:bg-zinc-900 dark:border-zinc-800 my-4">
          <label className="block text-sm font-medium text-foreground dark:text-zinc-100 mb-2">
            Клуб үүсгэх болсон шалтгаан *
          </label>
          <textarea
            required
            rows={4}
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Яагаад энэ клубыг үүсгэх гэж байгаагаа тайлбарлана уу..."
            className="w-full resize-y px-4 py-3 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Schedule Section */}
        <div className="rounded-xl border border-border bg-card p-6 dark:bg-zinc-900 dark:border-zinc-800 my-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-zinc-100 mb-4">
            Клубын хуваарь
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
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
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Өрөө
              </label>
              <input
                type="text"
                value={newSchedule.room}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, room: e.target.value })
                }
                placeholder="710"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
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
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
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
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Хуваарь нэмэх
          </button>

          {schedules.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-3">
                Нэмсэн хуваарь ({schedules.length}):
              </h4>
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg dark:bg-zinc-800/50 border border-border dark:border-zinc-700"
                >
                  <div className="text-sm text-foreground dark:text-zinc-100">
                    <span className="font-medium">
                      {DAYS.find((d) => d.value === schedule.dayOfWeek)?.label}
                    </span>
                    <span className="text-muted-foreground dark:text-gray-400 mx-2">•</span>
                    <span className="font-mono">{schedule.startTime} - {schedule.endTime}</span>
                    <span className="text-muted-foreground dark:text-gray-400 mx-2">•</span>
                    <span>Өрөө: {schedule.room}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    Устгах
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 my-4">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
            </svg>
            <p className="text-sm text-blue-900 dark:text-blue-200">
              Клуб үүсгэсний дараа Оюутны Холбооноос баталгаажуулах шаардлагатай
            </p>
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
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100 font-medium"
          >
            {isLoading ? "Үүсгэж байна..." : "Клуб үүсгэх"}
          </button>
        </div>
      </form>
    </div>
  );
}