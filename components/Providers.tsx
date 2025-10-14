// app/components/Providers.tsx

'use client';

import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from './SocketProvider';
import AuthGuard from './AuthGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGuard>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthGuard>
    </SessionProvider>
  );
}