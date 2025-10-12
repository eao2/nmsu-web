// app/clubs/[slug]/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function JoinRequestsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [club, setClub] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  useEffect(() => {
    fetchClubAndRequests();
  }, [params.slug, filter]);

  const fetchClubAndRequests = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/clubs?slug=${params.slug}`);
      const clubData = await response.json();

      if (clubData) {
        setClub(clubData);

        const requestsResponse = await fetch(`${apiUrl}/api/clubs/${clubData.id}/join-requests`);
        if (requestsResponse.ok) {
          const data = await requestsResponse.json();
          setRequests(
            filter === 'pending'
              ? data.filter((r: any) => r.status === 'PENDING')
              : data
          );
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${apiUrl}/api/join-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setSelectedRequest(null);
        fetchClubAndRequests();
      } else {
        alert('Алдаа гарлаа');
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Алдаа гарлаа');
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
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-zinc-100">Элсэлтийн хүсэлтүүд</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">{club.title}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            filter === 'pending'
              ? 'bg-primary text-primary-foreground dark:bg-zinc-100 dark:text-black'
              : 'bg-card text-foreground border border-border hover:bg-muted/50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'
          }`}
        >
          Хүлээгдэж буй
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground dark:bg-zinc-100 dark:text-black'
              : 'bg-card text-foreground border border-border hover:bg-muted/50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'
          }`}
        >
          Бүгд
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className={`bg-card border border-border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedRequest?.id === request.id ? 'ring-2 ring-primary dark:ring-white' : 'hover:bg-muted/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {request.user.image ? (
                    <Image
                      src={process.env.NEXT_PUBLIC_GET_FILE_URL + request.user.image}
                      alt={request.user.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border border-border dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground font-medium border border-border dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700">
                      {request.user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground dark:text-zinc-100">{request.user.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {request.user.studentCode} • {request.user.className}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    request.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                      : request.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  }`}
                >
                  {request.status === 'PENDING'
                    ? 'Хүлээгдэж буй'
                    : request.status === 'APPROVED'
                    ? 'Зөвшөөрсөн'
                    : 'Татгалзсан'}
                </span>
              </div>

              <div className="text-sm text-muted-foreground dark:text-gray-500">
                {new Date(request.createdAt).toLocaleDateString('mn-MN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-400">
              Хүсэлт байхгүй байна
            </div>
          )}
        </div>

        {/* Request Detail */}
        {selectedRequest && (
          <div className="lg:sticky lg:top-8 bg-card border border-border rounded-xl p-6 h-fit dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-foreground dark:text-zinc-100 mb-4">Хүсэлтийн дэлгэрэнгүй</h2>

            <div className="space-y-4 mb-6">
              {Object.entries(selectedRequest.answers).map(([key, fieldData]: [string, any]) => {
                // Handle the new data structure where fieldData contains label and value
                const label = fieldData.label || key;
                const value = fieldData.value || fieldData;
                
                return (
                  <div className='my-2' key={key}>
                    <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                      {label}:
                    </label>
                    {typeof value === 'string' && value.startsWith('/uploads/') ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 no-underline dark:text-zinc-100 dark:hover:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Файл харах
                      </a>
                    ) : Array.isArray(value) ? (
                      <div className="text-sm text-foreground dark:text-gray-300">{value.join(', ')}</div>
                    ) : (
                      <div className="text-sm text-foreground dark:text-gray-300">{value}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedRequest.status === 'PENDING' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selectedRequest.id, 'reject')}
                  className="flex-1 px-4 py-2 bg-red-600 text-zinc-100 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Татгалзах
                </button>
                <button
                  onClick={() => handleAction(selectedRequest.id, 'approve')}
                  className="flex-1 px-4 py-2 bg-green-600 text-zinc-100 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Зөвшөөрөх
                </button>
              </div>
            )}

            {selectedRequest.status !== 'PENDING' && (
              <div className="text-center text-sm text-muted-foreground dark:text-gray-500">
                Энэ хүсэлт аль хэдийн шийдэгдсэн байна
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}