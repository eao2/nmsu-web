"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Ирсэн", color: "bg-green-100 text-green-700" },
  { value: "LATE", label: "Хоцорсон", color: "bg-yellow-100 text-yellow-700" },
  { value: "SICK", label: "Өвчтэй", color: "bg-blue-100 text-blue-700" },
  {
    value: "EXCUSED",
    label: "Чөлөө авсан",
    color: "bg-purple-100 text-purple-700",
  },
  { value: "ABSENT", label: "Тасалсан", color: "bg-red-100 text-red-700" },
];

export default function AttendancePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: any }>({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(""); // <-- new field
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"record" | "history">("record");
  const [history, setHistory] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchClubAndMembers();
  }, [params.slug]);

  useEffect(() => {
    if (viewMode === "history" && club) {
      fetchHistory();
    }
  }, [viewMode, dateRange, club]);

  const fetchClubAndMembers = async () => {
    try {
      const clubResponse = await fetch(`/api/clubs/${params.slug}`);
      const clubData = await clubResponse.json();
      if (clubData) {
        setClub(clubData);
        setMembers(clubData.members || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `/api/clubs/${club.id}/attendance?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      if (response.ok) {
        const data = await response.json();
        setHistory(data); // array of activitySession objects
      }
    } catch (error) {
      console.error("Fetch history error:", error);
    }
  };

  const handleStatusChange = (userId: string, status: string) => {
    setAttendance({
      ...attendance,
      [userId]: {
        userId,
        status,
        notes: attendance[userId]?.notes || "",
        date: selectedDate,
      },
    });
  };

  const handleNotesChange = (userId: string, notes: string) => {
    setAttendance({
      ...attendance,
      [userId]: {
        ...attendance[userId],
        userId,
        notes,
        date: selectedDate,
      },
    });
  };

  const handleSave = async () => {
    const records = Object.values(attendance).filter((a: any) => a.status);

    if (records.length === 0) {
      alert("Ядаж нэг хүний ирц сонгоно уу");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/clubs/${club.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, date: selectedDate, description }),
      });

      if (response.ok) {
        alert("Ирц амжилттай хадгалагдлаа!");
        setAttendance({});
        setDescription(""); // clear description
      } else {
        alert("Ирц хадгалахад алдаа гарлаа");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Ирц хадгалахад алдаа гарлаа");
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Огноо",
      "Нэр",
      "Оюутны код",
      "Анги",
      "Төлөв",
      "Тэмдэглэл",
    ];
    const rows: any[] = [];

    history.forEach((session) => {
      session.attendances.forEach((att: any) => {
        rows.push([
          new Date(session.date).toLocaleDateString("mn-MN"),
          att.user.name,
          att.user.studentCode,
          att.user.className,
          STATUS_OPTIONS.find((s) => s.value === att.status)?.label ||
            att.status,
          att.notes || "",
        ]);
      });
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${club?.title}_${Date.now()}.csv`;
    link.click();
  };

  if (!club) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/50 rounded-lg w-1/3 mb-4 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
          <div className="h-64 bg-muted/50 rounded-lg border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white">
          Ирц
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">
          {club.title}
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode("record")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            viewMode === "record"
              ? "bg-primary text-primary-foreground dark:bg-white dark:text-black"
              : "bg-card text-foreground border border-border hover:bg-muted/50 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          Ирц бүртгэх
        </button>
        <button
          onClick={() => setViewMode("history")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            viewMode === "history"
              ? "bg-primary text-primary-foreground dark:bg-white dark:text-black"
              : "bg-card text-foreground border border-border hover:bg-muted/50 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          Түүх харах
        </button>
      </div>

      {viewMode === "record" ? (
        <div className="bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Огноо сонгох
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border dark:bg-zinc-800/50 dark:border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Гишүүн
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Төлөв
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Тэмдэглэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-zinc-700">
                {members.map((member) => (
                  <tr
                    key={member.userId}
                    className="hover:bg-muted/50 dark:hover:bg-zinc-800/50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {member.user.image ? (
                          <img
                            src={member.user.image}
                            alt={member.user.name}
                            className="w-10 h-10 rounded-full object-cover border border-border dark:border-zinc-700"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-medium border border-border dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                            {member.user.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground dark:text-white">
                            {member.user.name}
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-gray-400">
                            {member.user.studentCode} • {member.user.className}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={attendance[member.userId]?.status || ""}
                        onChange={(e) =>
                          handleStatusChange(member.userId, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      >
                        <option value="">Сонгох...</option>
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={attendance[member.userId]?.notes || ""}
                        onChange={(e) =>
                          handleNotesChange(member.userId, e.target.value)
                        }
                        placeholder="Тэмдэглэл..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
              Үйл ажиллагааны тайлбар
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Тайлбар..."
              className="resize-y w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              {isSaving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-xs text-muted-foreground dark:text-gray-400 mb-1">
                  Эхлэх огноо
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground dark:text-gray-400 mb-1">
                  Дуусах огноо
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Excel татах
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border dark:bg-zinc-800/50 dark:border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Огноо
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Үйл ажиллагааны тайлбар
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Гишүүн
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Төлөв
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground dark:text-white">
                    Тэмдэглэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-zinc-700">
                {history.map((session) =>
                  session.attendances.map((att: any) => (
                    <tr
                      key={att.id}
                      className="hover:bg-muted/50 dark:hover:bg-zinc-800/50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-foreground dark:text-white">
                        {new Date(session.date).toLocaleDateString("mn-MN")}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground dark:text-gray-400">
                        {session.description || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {att.user.image ? (
                            <img
                              src={att.user.image}
                              alt={att.user.name}
                              className="w-8 h-8 rounded-full object-cover border border-border dark:border-zinc-700"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-foreground text-sm font-medium border border-border dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                              {att.user.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-foreground dark:text-white">
                              {att.user.name}
                            </div>
                            <div className="text-xs text-muted-foreground dark:text-gray-400">
                              {att.user.studentCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            STATUS_OPTIONS.find((s) => s.value === att.status)
                              ?.color ||
                            "bg-muted text-foreground dark:bg-zinc-800 dark:text-white"
                          }`}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === att.status)
                            ?.label || att.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground dark:text-gray-400">
                        {att.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {history.length === 0 && (
              <div className="py-12 text-center text-muted-foreground dark:text-gray-400">
                Энэ хугацаанд ирц бүртгэгдээгүй байна
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
