// types/next-auth.d.ts

import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      profileComplete: boolean;
    };
  }

  interface User {
    role: Role;
    profileComplete: boolean;
  }
  
  interface Profile {
    picture?: string;
  }
}