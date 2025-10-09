// app/clubs/[slug]/leave/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

export default function LeaveClubPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirm('Та энэ клубаас гарах хүсэлт илгээхдээ итгэлтэй байна уу?')) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First, get club ID
      const clubResponse = await fetch(`/api/clubs?slug=${params.slug}`);
      const club = await clubResponse.json();

      if (!club) {
        alert('Клуб олдсонгүй');
        return;
      }

      const response = await fetch(`/api/clubs/${club.id}/leave-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || null }),
      });

      if (response.ok) {
        alert('Таны хүсэлт амжилттай илгээгдлээ!');
        router.push(`/clubs/${params.slug}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Хүсэлт илгээхэд алдаа гарлаа');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Хүсэлт илгээхэд алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-2">Клубаас гарах</h1>
      <p className="text-muted-foreground dark:text-gray-400 mb-8">
        Та энэ клубаас гарах хүсэлт илгээх гэж байна. Админ таны хүсэлтийг хянаж шийдвэр гаргана.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
            Шалтгаан (заавал биш)
          </label>
          <textarea
            rows={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent resize-none transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            placeholder="Та яагаад клубаас гарах гэж байгаагаа бичиж болно..."
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            <strong>Анхааруулга:</strong> Хүсэлт баталгаажсаны дараа та энэ клубын гишүүн байхаа болно.
          </p>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Буцах
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-600 text-zinc-100 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
          </button>
        </div>
      </form>
    </div>
  );
}