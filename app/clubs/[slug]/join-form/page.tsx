'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

const FIELD_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'textarea', label: 'Урт текст' },
  { value: 'number', label: 'Тоо' },
  { value: 'file', label: 'Файл' },
  { value: 'select', label: 'Сонголт (dropdown)' },
  { value: 'radio', label: 'Радио товч' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Огноо' },
  { value: 'url', label: 'URL холбоос' },
];

export default function JoinFormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [club, setClub] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
          setFields(formData.fields || []);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        type: 'text',
        label: '',
        placeholder: '',
        required: false,
        options: [],
        description: '',
      },
    ]);
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/clubs/${club.id}/join-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });

      if (response.ok) {
        alert('Маягт амжилттай хадгалагдлаа!');
        router.push(`/clubs/${params.slug}`);
      } else {
        alert('Хадгалахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Хадгалахад алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  if (!club) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/50 rounded-lg w-1/3 mb-4 border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
          <div className="h-64 bg-muted/50 rounded-lg border border-border dark:bg-zinc-900/50 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white">Элсэлтийн маягт засах</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">{club.title}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Буцах
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="my-4 bg-card border border-border rounded-xl p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                { (index > 0) && (
                <button
                  type="button"
                  onClick={() => moveField(index, 'up')}
                  disabled={index === 0}
                  className="w-8 h-8 text-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                  </svg>
                </button>
                )}
                {(index < fields.length - 1) && (
                  <button
                    type="button"
                    onClick={() => moveField(index, 'down')}
                    disabled={index === fields.length - 1}
                    className="w-8 h-8 text-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                    </svg>
                  </button>
                )}
                <span className="text-sm font-medium text-muted-foreground dark:text-gray-500">#{index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeField(index)}
                  className="px-4 py-2 text-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Устгах
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                  Төрөл
                </label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, { type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                  Асуулт / Label
                </label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="Таны асуулт"
                />
              </div>

              {['text', 'textarea', 'number', 'url'].includes(field.type) && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                    placeholder="Жишээ текст..."
                  />
                </div>
              )}

              {['select', 'radio', 'checkbox'].includes(field.type) && (
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                    Сонголтууд (мөр бүр нэг сонголт)
                  </label>
                  <textarea
                    rows={3}
                    value={(field.options || []).join('\n')}
                    onChange={(e) =>
                      updateField(index, { options: e.target.value.split('\n').filter(Boolean) })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                    placeholder="Сонголт 1&#10;Сонголт 2&#10;Сонголт 3"
                  />
                </div>
              )}

              {field.type === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                    Файлын төрөл
                  </label>
                  <input
                    type="text"
                    value={field.accept || ''}
                    onChange={(e) => updateField(index, { accept: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                    placeholder="image/*,.pdf,.docx"
                  />
                </div>
              )}

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground dark:text-gray-400 mb-1">
                  Тайлбар (заавал биш)
                </label>
                <input
                  type="text"
                  value={field.description || ''}
                  onChange={(e) => updateField(index, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="Нэмэлт тайлбар..."
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus-visible:ring-2 focus-visible:ring-primary focus:ring-offset-0 dark:bg-zinc-800 dark:border-zinc-600"
                  />
                  <span className="text-sm text-foreground dark:text-gray-300">Заавал бөглөх</span>
                </label>
              </div>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="bg-muted/50 rounded-xl border-2 border-dashed border-border p-12 text-center dark:bg-zinc-800/50 dark:border-zinc-700">
            <p className="text-muted-foreground dark:text-gray-400 mb-4">Маягтанд талбар нэмээгүй байна</p>
            <button
              onClick={addField}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              Эхний талбар нэмэх
            </button>
          </div>
        )}

        {fields.length > 0 && (
          <button
            onClick={addField}
            className="mb-2 w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-80"
          >
            + Талбар нэмэх
          </button>
        )}

        <div className="my-2 flex gap-4 flex-col sm:flex-row">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-border bg-background text-foreground rounded-lg hover:bg-muted/50 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            Цуцлах
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>
    </div>
  );
}