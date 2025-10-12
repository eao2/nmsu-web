'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== 'UNIVERSAL_ADMIN') {
    redirect('/clubs');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-8">Админ хэсэг</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/clubs"
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-zinc-800 no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Клубууд</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Клубуудыг удирдах</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/schedules"
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-zinc-800 no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Хуваарь</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Клубуудын хуваарь харах</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/events"
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-zinc-800 no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Эвентүүд</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Эвент удирдах</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-zinc-800 no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
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
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Тайлангууд</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Бүх тайланг харах</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-zinc-800 no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Хэрэглэгчид</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Хэрэглэгчдийг удирдах</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/audit-logs"
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-zinc-800 no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Үйл ажиллагаа</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Системийн лог харах</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}