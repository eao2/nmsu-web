'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

export default function JoinClubPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [club, setClub] = useState<any>(null);
  const [joinForm, setJoinForm] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchClubAndForm();
  }, [params.slug]);

  const fetchClubAndForm = async () => {
    try {
      const response = await fetch(`/api/clubs?slug=${params.slug}`);
      const clubData = await response.json();

      if (clubData) {
        setClub(clubData);

        const formResponse = await fetch(`/api/clubs/${clubData.id}/join-form`);
        if (formResponse.ok) {
          const formData = await formResponse.json();
          setJoinForm(formData);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload?folder=join-requests', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { path } = await response.json();
      setAnswers({ ...answers, [fieldId]: path });
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Transform answers to include both field ID and label
    const transformedAnswers: { [key: string]: any } = {};
    
    fields.forEach((field: any) => {
      if (answers[field.id] !== undefined) {
        transformedAnswers[field.id] = {
          label: field.label,
          value: answers[field.id]
        };
      }
    });

    const response = await fetch(`/api/clubs/${club.id}/join-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: transformedAnswers }),
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

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted/50 rounded-lg w-1/2 mb-4 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
          <div className="h-32 bg-muted/50 rounded-lg border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  if (!club || !club.allowJoinRequests) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
          Клуб одоогоор элсэлт хүлээн авахгүй байна
        </h1>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 rounded-md font-medium transition-colors duration-200 border whitespace-nowrap bg-primary text-primary-foreground border-primary dark:bg-white dark:text-black dark:border-white"
        >
          Буцах
        </button>
      </div>
    );
  }

  const fields = joinForm?.fields || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white mb-2">{club.title}</h1>
      <p className="text-muted-foreground dark:text-gray-400 mb-8">Элсэлтийн маягт бөглөх</p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800">
        {fields.map((field: any) => (
          <div className='mb-3' key={field.id}>
            <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                required={field.required}
                value={answers[field.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                placeholder={field.placeholder}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                required={field.required}
                rows={4}
                value={answers[field.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                placeholder={field.placeholder}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                required={field.required}
                value={answers[field.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            )}

            {field.type === 'file' && (
              <input
                type="file"
                required={field.required}
                accept={field.accept || '*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(field.id, file);
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:file:bg-zinc-700 dark:file:text-gray-200 dark:hover:file:bg-zinc-600"
              />
            )}

            {field.type === 'select' && (
              <select
                required={field.required}
                value={answers[field.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="">Сонгох...</option>
                {field.options?.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === 'radio' && (
              <div className="space-y-2">
                {field.options?.map((opt: string) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={field.id}
                      value={opt}
                      required={field.required}
                      checked={answers[field.id] === opt}
                      onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                      className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
                    />
                    <span className="text-sm text-foreground dark:text-gray-300">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div className="space-y-2">
                {field.options?.map((opt: string) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={(answers[field.id] || []).includes(opt)}
                      onChange={(e) => {
                        const current = answers[field.id] || [];
                        const updated = e.target.checked
                          ? [...current, opt]
                          : current.filter((v: string) => v !== opt);
                        setAnswers({ ...answers, [field.id]: updated });
                      }}
                      className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
                    />
                    <span className="text-sm text-foreground dark:text-gray-300">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {field.type === 'date' && (
              <input
                type="date"
                required={field.required}
                value={answers[field.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              />
            )}

            {field.type === 'url' && (
              <input
                type="url"
                required={field.required}
                value={answers[field.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="https://example.com"
              />
            )}

            {field.description && (
              <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">{field.description}</p>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
            Элсэх хүсэлт илгээх.
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex justify-center items-center border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700 w-10 h-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-circle dark:text-white" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>
            </svg>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            {isSubmitting ? 'Илгээж байна...' : 'Илгээх'}
          </button>
        </div>
      </form>
    </div>
  );
}