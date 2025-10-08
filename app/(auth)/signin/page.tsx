'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/clubs' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 dark:bg-zinc-900">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
          <Image
            src="/nmsu-logo-sm.svg"
            alt="NMSU Logo"
            fill
          />
          </div>
          <h1 className="text-xl font-bold text-foreground dark:text-white mb-2 tracking-tight">
            New Mongol Student Union
          </h1>
        </div>

        {error === 'domain' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-400">
              Зөвхөн их сургуулийн имэйл хаягаар нэвтэрч болно
            </p>
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-background border-2 border-border rounded-lg hover:bg-muted/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888888" className="bi bi-google" viewBox="0 0 16 16">
            <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
          </svg>
          <span className="font-medium text-foreground dark:text-white">
            {isLoading ? 'Нэвтэрч байна...' : 'Google-ээр нэвтрэх'}
          </span>
        </button>

        <p className="mt-6 text-xs text-center text-muted-foreground dark:text-gray-500">
          Нэвтрэх товч дарснаар та манай үйлчилгээний нөхцөлийг зөвшөөрч байна
        </p>
      </div>
    </div>
  );
}