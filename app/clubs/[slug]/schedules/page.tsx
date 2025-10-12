"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface Schedule {
  id: string;
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

export default function ClubSchedulesPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Schedule>({
    id: '',
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
    room: '',
  });
  const [newSchedule, setNewSchedule] = useState<Omit<Schedule, 'id'>>({
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
    room: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  useEffect(() => {
    fetchSchedules();
  }, [params.slug]);

  const fetchSchedules = async () => {
    try {
      // First get club ID from slug
      const clubRes = await fetch(`${apiUrl}/api/clubs?slug=${params.slug}`);
      const club = await clubRes.json();

      if (club.id) {
        const response = await fetch(`${apiUrl}/api/clubs/${club.id}/schedules`);
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSchedule.startTime || !newSchedule.endTime || !newSchedule.room) {
      alert('Бүх талбарыг бөглөнө үү');
      return;
    }

    try {
      const clubRes = await fetch(`${apiUrl}/api/clubs?slug=${params.slug}`);
      const club = await clubRes.json();

      const response = await fetch(`${apiUrl}/api/clubs/${club.id}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });

      if (response.ok) {
        fetchSchedules();
        setNewSchedule({
          dayOfWeek: 'MONDAY',
          startTime: '',
          endTime: '',
          room: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Хуваарь нэмэхэд алдаа гарлаа');
      }
    } catch (error) {
      console.error('Add schedule error:', error);
      alert('Хуваарь нэмэхэд алдаа гарлаа');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setIsEditing(schedule.id);
    setEditForm(schedule);
  };

  const handleUpdate = async () => {
    try {
      const clubRes = await fetch(`${apiUrl}/api/clubs?slug=${params.slug}`);
      const club = await clubRes.json();

      const response = await fetch(
        `${apiUrl}/api/clubs/${club.id}/schedules/${editForm.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        fetchSchedules();
        setIsEditing(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Хуваарь засахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Update schedule error:', error);
      alert('Хуваарь засахад алдаа гарлаа');
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Энэ хуваарийг устгахдаа итгэлтэй байна уу?')) return;

    try {
      const clubRes = await fetch(`${apiUrl}/api/clubs?slug=${params.slug}`);
      const club = await clubRes.json();

      const response = await fetch(
        `${apiUrl}/api/clubs/${club.id}/schedules/${scheduleId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchSchedules();
      } else {
        alert('Хуваарь устгахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Delete schedule error:', error);
      alert('Хуваарь устгахад алдаа гарлаа');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-foreground dark:text-zinc-100">
          Клубын хуваарь удирдах
        </h1>
        <Link
          href={`/clubs/${params.slug}`}
          className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          Буцах
        </Link>
      </div>

      {/* Add New Schedule */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-foreground dark:text-zinc-100 mb-4">
          Шинэ хуваарь нэмэх
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
              Өдөр
            </label>
            <select
              value={newSchedule.dayOfWeek}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  dayOfWeek: e.target.value as DayOfWeek,
                })
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
              placeholder="301"
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
          onClick={handleAdd}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Хуваарь нэмэх
        </button>
      </div>

      {/* Schedules List */}
      <div className="bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-foreground dark:text-zinc-100 mb-4">
          Одоогийн хуваарь ({schedules.length})
        </h2>

        {schedules.length === 0 ? (
          <p className="text-muted-foreground dark:text-gray-400 text-center py-8">
            Хуваарь байхгүй байна
          </p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 bg-muted/50 rounded-lg border border-border dark:bg-zinc-800/50 dark:border-zinc-700"
              >
                {isEditing === schedule.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={editForm.dayOfWeek}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            dayOfWeek: e.target.value as DayOfWeek,
                          })
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      >
                        {DAYS.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={editForm.room}
                        onChange={(e) =>
                          setEditForm({ ...editForm, room: e.target.value })
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      />

                      <input
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) =>
                          setEditForm({ ...editForm, startTime: e.target.value })
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      />

                      <input
                        type="time"
                        value={editForm.endTime}
                        onChange={(e) =>
                          setEditForm({ ...editForm, endTime: e.target.value })
                        }
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Хадгалах
                      </button>
                      <button
                        onClick={() => setIsEditing(null)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                      >
                        Болих
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-foreground dark:text-zinc-100">
                        <span className="font-semibold">
                          {DAYS.find((d) => d.value === schedule.dayOfWeek)?.label}
                        </span>
                        <span>•</span>
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                        <span>•</span>
                        <span>Өрөө: {schedule.room}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}