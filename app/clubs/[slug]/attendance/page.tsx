// app/clubs/[slug]/attendance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Image from "next/image";

const STATUS_OPTIONS = [
  {
    value: "PRESENT",
    label: "Ирсэн",
    color:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  },
  {
    value: "LATE",
    label: "Хоцорсон",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  },
  {
    value: "SICK",
    label: "Өвчтэй",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  },
  {
    value: "EXCUSED",
    label: "Чөлөө авсан",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  },
  {
    value: "ABSENT",
    label: "Тасалсан",
    color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  },
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
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"record" | "history" | "calendar" | "member">(
    "record"
  );
  const [history, setHistory] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [attendanceDates, setAttendanceDates] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [memberAttendance, setMemberAttendance] = useState<any[]>([]);

  // Add loading states
  const [isLoadingClub, setIsLoadingClub] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [isLoadingMember, setIsLoadingMember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClubAndMembers();
  }, [params.slug]);

  useEffect(() => {
    if (viewMode === "record" && club) {
      fetchTodayAttendance();
    }
  }, [selectedDate, club, viewMode]);

  useEffect(() => {
    if (viewMode === "history" && club) {
      fetchHistory();
    }
  }, [viewMode, dateRange, club]);

  useEffect(() => {
    if (viewMode === "calendar" && club) {
      fetchAttendanceDates();
    }
  }, [viewMode, club]);

  useEffect(() => {
    if (viewMode === "member" && club && selectedMember) {
      fetchMemberAttendance();
    }
  }, [viewMode, selectedMember, club, dateRange]);

  useEffect(() => {
    const today = new Date();
    const localDate = today.toISOString().split("T")[0];
    setSelectedDate(localDate);
  }, []);

  const fetchClubAndMembers = async () => {
    setIsLoadingClub(true);
    setError(null);

    try {
      const clubResponse = await fetch(`/api/clubs?slug=${params.slug}`);

      if (!clubResponse.ok) {
        throw new Error("Failed to fetch club data");
      }

      const clubData = await clubResponse.json();

      if (clubData) {
        setClub(clubData);
        setMembers(clubData.members || []);
      } else {
        setError("Клуб олдсонгүй");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Клубын мэдээллийг авахад алдаа гарлаа");
    } finally {
      setIsLoadingClub(false);
    }
  };

  const fetchAttendanceDates = async () => {
    if (!club) return;

    setIsLoadingDates(true);
    setError(null);

    try {
      const response = await fetch(`/api/clubs/${club.id}/attendance/dates`);

      if (!response.ok) {
        throw new Error("Failed to fetch attendance dates");
      }

      const data = await response.json();
      setAttendanceDates(data);
    } catch (error) {
      console.error("Fetch attendance dates error:", error);
      setError("Ирцийн огноог авахад алдаа гарлаа");
    } finally {
      setIsLoadingDates(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!club) return;

    setIsLoadingAttendance(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/clubs/${club.id}/attendance?date=${selectedDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const sessions = await response.json();
      if (sessions.length > 0) {
        const session = sessions[0];
        setDescription(session.description || "");

        const localDate = new Date(session.date);
        const formattedDate = localDate.toISOString().split("T")[0];

        const existingAttendance: { [key: string]: any } = {};
        session.attendances.forEach((att: any) => {
          existingAttendance[att.userId] = {
            userId: att.userId,
            status: att.status,
            notes: att.notes || "",
            date: formattedDate,
          };
        });
        setAttendance(existingAttendance);
      } else {
        setDescription("");
        setAttendance({});
      }
    } catch (error) {
      console.error("Fetch today attendance error:", error);
      setError("Өнөөдрийн ирцийг авахад алдаа гарлаа");
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const fetchHistory = async () => {
    if (!club) return;

    setIsLoadingHistory(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/clubs/${club.id}/attendance?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history data");
      }

      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Fetch history error:", error);
      setError("Түүхийг авахад алдаа гарлаа");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchMemberAttendance = async () => {
    if (!club || !selectedMember) return;

    setIsLoadingMember(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/clubs/${club.id}/attendance?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch member attendance");
      }

      const sessions = await response.json();
      const memberRecords = sessions
        .map((session: any) => {
          const record = session.attendances.find(
            (att: any) => att.userId === selectedMember
          );
          return record ? { ...record, sessionDate: session.date, sessionDescription: session.description } : null;
        })
        .filter((record: any) => record !== null);

      setMemberAttendance(memberRecords);
    } catch (error) {
      console.error("Fetch member attendance error:", error);
      setError("Гишүүний ирцийг авахад алдаа гарлаа");
    } finally {
      setIsLoadingMember(false);
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
    setError(null);

    try {
      const response = await fetch(`/api/clubs/${club.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records,
          date: selectedDate,
          description,
        }),
      });

      if (response.ok) {
        alert("Ирц амжилттай хадгалагдлаа!");
        fetchTodayAttendance();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save attendance");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      setError(error.message || "Ирц хадгалахад алдаа гарлаа");
      alert(error.message || "Ирц хадгалахад алдаа гарлаа");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Энэ ирцийг устгахдаа итгэлтэй байна уу?")) return;

    try {
      const response = await fetch(
        `/api/clubs/${club.id}/attendance/${sessionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Ирц амжилттай устгагдлаа!");
        if (viewMode === "calendar") {
          fetchAttendanceDates();
        } else {
          fetchHistory();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete session");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      setError(error.message || "Устгахад алдаа гарлаа");
      alert(error.message || "Устгахад алдаа гарлаа");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Огноо",
      "Тайлбар",
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
          session.description || "",
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

  const handleDateClick = (session: any) => {
    setSelectedSession(session);
    setViewMode("record");

    const localDate = new Date(session.date);
    const formattedDate = localDate.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
  };

  const isPastDate = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  };

  const isToday = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  };

  const canDeleteSession = (sessionDate: string) => {
    return isToday(sessionDate);
  };

  if (isLoadingClub) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/50 rounded-lg w-1/3 mb-4 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
          <div className="h-64 bg-muted/50 rounded-lg border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  if (error && !club) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="font-medium">Алдаа гарлаа</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-zinc-100 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Дахин ачаалах
          </button>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
          <p>Клуб олдсонгүй</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-xl font-bold tracking-tight text-foreground dark:text-zinc-100">
          Ирц
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1 text-xs sm:text-base">
          {club.title}
        </p>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-4 sm:mb-6 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setViewMode("record")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-base whitespace-nowrap flex-shrink-0 ${
            viewMode === "record"
              ? "bg-primary text-primary-foreground dark:bg-zinc-100 dark:text-black bg-black text-zinc-100"
              : "bg-card text-foreground hover:bg-muted/50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          Ирц бүртгэх
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-base whitespace-nowrap flex-shrink-0 ${
            viewMode === "calendar"
              ? "bg-primary text-primary-foreground dark:bg-zinc-100 dark:text-black bg-black text-zinc-100"
              : "bg-card text-foreground hover:bg-muted/50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          Огноогоор
        </button>
        <button
          onClick={() => setViewMode("history")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-base whitespace-nowrap flex-shrink-0 ${
            viewMode === "history"
              ? "bg-primary text-primary-foreground dark:bg-zinc-100 dark:text-black bg-black text-zinc-100"
              : "bg-card text-foreground hover:bg-muted/50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          Түүх
        </button>
        <button
          onClick={() => setViewMode("member")}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-base whitespace-nowrap flex-shrink-0 ${
            viewMode === "member"
              ? "bg-primary text-primary-foreground dark:bg-zinc-100 dark:text-black bg-black text-zinc-100"
              : "bg-card text-foreground border-border hover:bg-muted/50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          Гишүүнээр
        </button>
      </div>

      {viewMode === "member" ? (
        <div className="bg-card border border-border rounded-xl p-3 sm:p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Гишүүн сонгох
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-sm"
              >
                <option value="">Гишүүн сонгоно уу</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name} - {member.user.className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Эхлэх огноо
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Дуусах огноо
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-sm"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {isLoadingMember ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-primary dark:border-white"></div>
            </div>
          ) : selectedMember ? (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                <table className="min-w-full">
                  <thead className="bg-muted/50 border-b border-border dark:bg-zinc-800/50 dark:border-zinc-700">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground dark:text-zinc-100">
                        Огноо
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground dark:text-zinc-100 hidden sm:table-cell">
                        Тайлбар
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground dark:text-zinc-100">
                        Төлөв
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground dark:text-zinc-100 hidden md:table-cell">
                        Тэмдэглэл
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-zinc-700">
                    {memberAttendance.map((record: any) => (
                      <tr
                        key={record.id}
                        className="hover:bg-muted/50 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground dark:text-zinc-100 whitespace-nowrap">
                          {new Date(record.sessionDate).toLocaleDateString("mn-MN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground dark:text-gray-400 hidden sm:table-cell max-w-xs truncate">
                          {record.sessionDescription || "-"}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                              STATUS_OPTIONS.find((s) => s.value === record.status)
                                ?.color ||
                              "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                            }`}
                          >
                            {STATUS_OPTIONS.find((s) => s.value === record.status)
                              ?.label || record.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                          {record.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {memberAttendance.length === 0 && (
                <div className="py-8 sm:py-12 text-center text-sm text-muted-foreground dark:text-gray-400">
                  Ирц бүртгэгдээгүй байна
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 sm:py-12 text-center text-sm text-muted-foreground dark:text-gray-400">
              Гишүүн сонгоно уу
            </div>
          )}
        </div>
      ) : viewMode === "calendar" ? (
        <div className="bg-card border border-border rounded-xl p-3 sm:p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-base sm:text-xl font-bold text-foreground dark:text-zinc-100 mb-4">
            Ирцийн огноонууд
          </h2>

          {isLoadingDates ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-primary dark:border-white"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {attendanceDates.map((session) => (
                <div
                  key={session.id}
                  className="bg-background border border-border rounded-lg p-3 sm:p-4 dark:bg-zinc-800 dark:border-zinc-700 relative group"
                >
                  <div
                    onClick={() => handleDateClick(session)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground dark:text-zinc-100 text-xs sm:text-base pr-8">
                        {new Date(session.date).toLocaleDateString("mn-MN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </h3>
                      <span className="text-xs text-muted-foreground dark:text-gray-400 whitespace-nowrap">
                        {session.attendanceCount || 0} гишүүн
                      </span>
                    </div>
                    {session.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 line-clamp-2">
                        {session.description}
                      </p>
                    )}
                  </div>
                  {canDeleteSession(session.date) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="absolute top-2 right-2 px-2 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors duration-200 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                    >
                      Устгах
                    </button>
                  )}
                </div>
              ))}

              {attendanceDates.length === 0 && (
                <div className="col-span-full text-center py-8 text-sm text-muted-foreground dark:text-gray-400">
                  Ирц бүртгэгдээгүй байна
                </div>
              )}
            </div>
          )}
        </div>
      ) : viewMode === "record" ? (
        <div className="bg-card border border-border rounded-xl p-3 sm:p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="mb-4 sm:mb-6 grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Огноо сонгох
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-sm"
                max={new Date().toISOString().split("T")[0]}
              />
              {isPastDate(selectedDate) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Өнгөрсөн огнооны ирцийг засах боломжгүй
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Үйл ажиллагааны тайлбар
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Жишээ: Долоо хоногийн хурал, сэдэв, бүрэлдэхүүн зэрэг дэлгэрэнгүй мэдээлэл оруулна уу..."
                rows={5}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 text-sm"
                disabled={isPastDate(selectedDate)}
              />
            </div>
          </div>

          {isLoadingAttendance ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-primary dark:border-white"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                  <table className="min-w-full">
                    <thead className="bg-muted/50 border-b border-border dark:bg-zinc-800/50 dark:border-zinc-700">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground dark:text-zinc-100">
                          Гишүүн
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground dark:text-zinc-100">
                          Төлөв
                        </th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground dark:text-zinc-100 md:table-cell">
                          Тэмдэглэл
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-zinc-700">
                      {members.map((member) => (
                        <tr
                          key={member.userId}
                          className="hover:bg-muted/50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <div className="flex items-center gap-2">
                              {member.user.image ? (
                                <Image
                                  src={member.user.image}
                                  alt={member.user.name}
                                  width={40}
                                  height={40}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-border dark:border-zinc-700 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-medium border border-border dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 flex-shrink-0 text-xs sm:text-sm">
                                  {member.user.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-foreground dark:text-zinc-100 text-xs sm:text-sm truncate">
                                  {member.user.name}
                                </div>
                                <div className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                                  {member.user.studentCode}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <select
                              value={attendance[member.userId]?.status || "ABSENT"}
                              onChange={(e) =>
                                handleStatusChange(member.userId, e.target.value)
                              }
                              className="w-full min-w-28 px-2 py-1.5 sm:px-3 sm:py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-xs"
                              disabled={isPastDate(selectedDate)}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 md:table-cell">
                            <input
                              type="text"
                              value={attendance[member.userId]?.notes || ""}
                              onChange={(e) =>
                                handleNotesChange(member.userId, e.target.value)
                              }
                              placeholder="Тэмдэглэл..."
                              className="w-full min-w-28 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 text-sm"
                              disabled={isPastDate(selectedDate)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving || isPastDate(selectedDate)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100 font-medium text-sm sm:text-base"
                >
                  {isSaving ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-3 sm:p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-muted-foreground dark:text-gray-400 mb-1">
                  Эхлэх огноо
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-sm"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-muted-foreground dark:text-gray-400 mb-1">
                  Дуусах огноо
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-sm"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-zinc-100 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Excel татах
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-b-2 border-primary dark:border-white"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4 sm:space-y-6">
                {history.map((session) => (
                  <div
                    key={session.id}
                    className="bg-background border border-border rounded-lg overflow-hidden dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <div className="bg-muted/50 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border dark:bg-zinc-700/50 dark:border-zinc-600">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="font-semibold text-foreground dark:text-zinc-100 text-xs sm:text-base">
                          {new Date(session.date).toLocaleDateString("mn-MN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long",
                          })}
                        </h3>
                        {session.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mt-1 line-clamp-2 break-words">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {session.attendances && session.attendances.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50 dark:bg-zinc-700/50">
                            <tr>
                              <th className="px-3 sm:px-4 py-2 text-left text-xs font-semibold text-foreground dark:text-zinc-100">
                                Гишүүн
                              </th>
                              <th className="px-3 sm:px-4 py-2 text-left text-xs font-semibold text-foreground dark:text-zinc-100">
                                Төлөв
                              </th>
                              <th className="px-3 sm:px-4 py-2 text-left text-xs font-semibold text-foreground dark:text-zinc-100 hidden sm:table-cell">
                                Тэмдэглэл
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border dark:divide-zinc-700">
                            {session.attendances.map((att: any) => (
                              <tr
                                key={att.id}
                                className="hover:bg-muted/50 dark:hover:bg-zinc-700/50"
                              >
                                <td className="px-3 sm:px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    {att.user.image ? (
                                      <Image
                                        src={att.user.image}
                                        alt={att.user.name}
                                        width={32}
                                        height={32}
                                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-border dark:border-zinc-700 flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center text-foreground text-xs font-medium border border-border dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 flex-shrink-0">
                                        {att.user.name?.charAt(0) || "U"}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs sm:text-sm font-medium text-foreground dark:text-zinc-100 truncate">
                                        {att.user.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                                        {att.user.studentCode}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-4 py-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                      STATUS_OPTIONS.find(
                                        (s) => s.value === att.status
                                      )?.color ||
                                      "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                                    }`}
                                  >
                                    {STATUS_OPTIONS.find(
                                      (s) => s.value === att.status
                                    )?.label || att.status}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground dark:text-gray-400 hidden sm:table-cell">
                                  <span className="line-clamp-2">{att.notes || "-"}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-3 sm:px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
                        Ирц бүртгэгдээгүй байна
                      </div>
                    )}
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="py-8 sm:py-12 text-center text-sm text-muted-foreground dark:text-gray-400">
                    Энэ хугацаанд ирц бүртгэгдээгүй байна
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}