'use client';

import { useState } from 'react';

interface PostFormProps {
  clubId: string;
  onPostCreated: () => void;
}

export default function PostForm({ clubId, onPostCreated }: PostFormProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const attachments: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload?folder=posts', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const { path } = await uploadResponse.json();
          attachments.push(path);
        }
      }

      const response = await fetch(`/api/clubs/${clubId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, attachments }),
      });

      if (response.ok) {
        setContent('');
        setFiles([]);
        onPostCreated();
      }
    } catch (error) {
      console.error('Create post error:', error);
      alert('Нийтлэл үүсгэхэд алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-6 text-foreground dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Юу бодож байна..."
        rows={3}
        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent resize-none transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
      />

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from(files).map((file, index) => (
            <div
              key={index}
              className="relative bg-muted/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border dark:bg-zinc-800/50 dark:text-gray-300 dark:border-zinc-700"
            >
              {file.name}
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                className="ml-2 text-destructive hover:text-destructive/90 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200 dark:text-gray-400 dark:hover:text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          {isSubmitting ? "Нийтэлж байна..." : "Нийтлэх"}
        </button>
      </div>
    </form>
  );
}