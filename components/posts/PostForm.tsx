// components/posts/PostForm.tsx
'use client';

import { useState } from 'react';

interface PostFormProps {
  clubId: string;
  onPostCreated: () => void;
}

export default function PostForm({ clubId, onPostCreated }: PostFormProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const newPaths: string[] = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload?folder=posts', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const { path } = await uploadResponse.json();
          newPaths.push(path);
        }
      }

      setFiles([...files, ...selectedFiles]);
      setUploadedPaths([...uploadedPaths, ...newPaths]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Файл хуулахад алдаа гарлаа');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setUploadedPaths(uploadedPaths.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/clubs/${clubId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          attachments: uploadedPaths 
        }),
      });

      if (response.ok) {
        // Confirm files are used
        await fetch('/api/upload/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePaths: uploadedPaths }),
        });

        setContent('');
        setFiles([]);
        setUploadedPaths([]);
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
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 dark:bg-zinc-900 dark:border-zinc-800">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Юу бодож байна..."
        rows={3}
        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent resize-none transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative bg-muted/50 rounded-lg px-3 py-2 text-sm text-foreground flex items-center gap-2 border border-border dark:bg-zinc-800/50 dark:text-gray-300 dark:border-zinc-700"
            >
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <label className={`cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''} dark:text-gray-400 dark:hover:text-zinc-100`}>
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
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        {isUploading && (
          <span className="text-sm text-muted-foreground dark:text-gray-400">Хуулж байна...</span>
        )}

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting || isUploading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-100"
        >
          {isSubmitting ? 'Нийтэлж байна...' : 'Нийтлэх'}
        </button>
      </div>
    </form>
  );
}