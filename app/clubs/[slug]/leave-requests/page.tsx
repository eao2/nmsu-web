'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function LeaveRequestsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [club, setClub] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    fetchClubAndRequests();
  }, [params.slug, filter]);

  const fetchClubAndRequests = async () => {
    try {
      const clubResponse = await fetch(`/api/clubs?slug=${params.slug}`);
      const clubData = await clubResponse.json();

      if (clubData) {
        setClub(clubData);

        const requestsResponse = await fetch(`/api/clubs/${clubData.id}/leave-requests`);
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
      const response = await fetch(`/api/leave-requests/${requestId}`, {
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">Гарах хүсэлтүүд</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">{club.title}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            filter === 'pending'
              ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black'
              : 'bg-card text-foreground border border-border hover:bg-muted/50 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800'
          }`}
        >
          Хүлээгдэж буй
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground dark:bg-white dark:text-black'
              : 'bg-card text-foreground border border-border hover:bg-muted/50 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800'
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
                      src={request.user.image}
                      alt={request.user.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border border-border dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground font-medium border border-border dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                      {request.user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground dark:text-white">{request.user.name}</h3>
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

              {request.reason && (
                <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 mb-2">
                  {request.reason}
                </p>
              )}

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
            <h2 className="text-xl font-bold text-foreground dark:text-white mb-4">Хүсэлтийн дэлгэрэнгүй</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                  Гишүүн
                </label>
                <div className="flex items-center gap-3">
                  {selectedRequest.user.image ? (
                    <Image
                      src={selectedRequest.user.image}
                      alt={selectedRequest.user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-border dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground font-medium border border-border dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                      {selectedRequest.user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-foreground dark:text-white">{selectedRequest.user.name}</div>
                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                      {selectedRequest.user.email}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                  Шалтгаан
                </label>
                <div className="text-sm text-foreground dark:text-gray-300 bg-muted/50 rounded-lg p-3 dark:bg-zinc-800/50">
                  {selectedRequest.reason || 'Шалтгаан заагаагүй'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                  Огноо
                </label>
                <div className="text-sm text-muted-foreground dark:text-gray-400">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('mn-MN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {selectedRequest.status === 'PENDING' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selectedRequest.id, 'reject')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Татгалзах
                </button>
                <button
                  onClick={() => handleAction(selectedRequest.id, 'approve')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
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