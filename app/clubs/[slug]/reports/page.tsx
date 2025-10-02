'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function ReportsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [club, setClub] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    semester: '',
    year: new Date().getFullYear(),
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchClubAndReports();
  }, [params.slug]);

  const fetchClubAndReports = async () => {
    try {
      const response = await fetch(`/api/clubs/${params.slug}`);
      const clubData = await response.json();

      if (clubData) {
        setClub(clubData);

        const reportsResponse = await fetch(`/api/clubs/${clubData.id}/reports`);
        if (reportsResponse.ok) {
          const data = await reportsResponse.json();
          setReports(data);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Файл сонгоно уу');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch('/api/upload?folder=reports', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      const { path } = await uploadResponse.json();

      // Create report
      const response = await fetch(`/api/clubs/${club.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          filePath: path,
        }),
      });

      if (response.ok) {
        alert('Тайлан амжилттай хадгалагдлаа!');
        setShowForm(false);
        setFormData({
          title: '',
          semester: '',
          year: new Date().getFullYear(),
        });
        setFile(null);
        fetchClubAndReports();
      } else {
        alert('Тайлан хадгалахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Тайлан хадгалахад алдаа гарлаа');
    } finally {
      setIsUploading(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white">Тайлангууд</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">{club.title}</p>
        </div>
        {(session?.user?.role === 'CLUB_ADMIN' ||
          session?.user?.role === 'UNIVERSAL_ADMIN') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            {showForm ? 'Хаах' : '+ Тайлан нэмэх'}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 mb-6 dark:bg-zinc-900 dark:border-zinc-800"
        >
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-4">Шинэ тайлан нэмэх</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Гарчиг *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="2024 оны намрын улирлын тайлан"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Улирал *
              </label>
              <select
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="">Сонгох...</option>
                <option value="Хавар">Хавар</option>
                <option value="Намар">Намар</option>
                <option value="Жилийн">Жилийн эцсийн</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Он *
              </label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                min={2020}
                max={2100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
                Файл * (PDF, Word, Excel)
              </label>
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
              />
            </div>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-6 py-3 border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              {isUploading ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <a
            key={report.id}
            href={report.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-colors duration-200 no-underline dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 dark:bg-white/10">
                <svg
                  className="w-6 h-6 text-primary dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground dark:text-white mb-1 truncate">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {report.semester} • {report.year}
                </p>
                <p className="text-xs text-muted-foreground dark:text-gray-500 mt-2">
                  {new Date(report.createdAt).toLocaleDateString('mn-MN')}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-400">
          Тайлан байхгүй байна
        </div>
      )}
    </div>
  );
}