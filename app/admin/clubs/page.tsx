// app/admin/clubs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function AdminClubsPage() {
  const { data: session } = useSession();
  const [clubs, setClubs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchClubs();
  }, [filter]);

  if (session?.user?.role !== 'UNIVERSAL_ADMIN') {
    redirect('/clubs');
  }

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/admin/clubs');
      const data = await response.json();
      
      if (filter === 'pending') {
        setClubs(data.filter((c: any) => !c.isConfirmed));
      } else {
        setClubs(data);
      }
    } catch (error) {
      console.error('Fetch clubs error:', error);
    }
  };

  const handleApprove = async (clubId: string) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchClubs();
      }
    } catch (error) {
      console.error('Approve club error:', error);
    }
  };

  const toggleActive = async (clubId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchClubs();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-8">Клубуудын удирдлага</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-zinc-100'
              : 'bg-zinc-100 text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Хүлээгдэж буй
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-zinc-100'
              : 'bg-zinc-100 text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Бүх клубууд
        </button>
      </div>

      <div className="space-y-4">
        {clubs.map((club) => (
          <div key={club.id} className="bg-zinc-100 rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {club.profileImage ? (
                  <Image
                    src={club.profileImage}
                    alt={club.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-zinc-100 font-bold text-xl">
                    {club.title.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{club.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{club.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{club._count?.members || 0} гишүүн</span>
                    <span>•</span>
                    <span>Үүсгэгч: {club.creator.name}</span>
                    <span>•</span>
                    <span>{new Date(club.createdAt).toLocaleDateString('mn-MN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {!club.isConfirmed && (
                  <button
                    onClick={() => handleApprove(club.id)}
                    className="px-4 py-2 bg-green-600 text-zinc-100 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Баталгаажуулах
                  </button>
                )}
                
                <button
                  onClick={() => toggleActive(club.id, club.isActive)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    club.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {club.isActive ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
                </button>

                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${
                    club.isConfirmed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {club.isConfirmed ? 'Баталгаажсан' : 'Хүлээгдэж буй'}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    club.isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {club.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {clubs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Клуб байхгүй байна
          </div>
        )}
      </div>
    </div>
  );
}