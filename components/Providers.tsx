// app/components/Providers.tsx

'use client';

import { SessionProvider } from 'next-auth/react';
import AuthGuard from './AuthGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/auth">
      <AuthGuard>
        {children}
      </AuthGuard>
    </SessionProvider>
  );
}